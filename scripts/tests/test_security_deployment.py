"""Offline regression checks for production configuration preservation."""
import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "deploy-security-20261022.sh"
PREFLIGHT = SCRIPT.read_text().split("<<'PY'\n", 1)[1].split("\nPY\n", 1)[0]


class DeploymentConfigTest(unittest.TestCase):
    def setUp(self):
        self.config = {"name": "frilo", "services": {}, "volumes": {}, "networks": {}}
        self.containers = []
        for name in ("backend", "frontend", "nginx"):
            self.config["services"][name] = {"image": "old:" + name}
            self.containers.append({
                "Config": {"Labels": {"com.docker.compose.project": "frilo", "com.docker.compose.service": name}},
                "Mounts": [], "HostConfig": {"PortBindings": {}},
                "NetworkSettings": {"Networks": {"frilo_frilo": {"Aliases": [name]}}},
            })
        self.config["services"]["nginx"]["volumes"] = [
            {"type": "bind", "source": "/etc/letsencrypt", "target": "/etc/letsencrypt", "read_only": True},
            {"type": "volume", "source": "uploads", "target": "/uploads", "read_only": True},
        ]
        self.config["volumes"]["uploads"] = {"name": "frilo_public_uploads"}
        self.containers[2]["Mounts"] = [
            {"Type": "bind", "Source": "/etc/letsencrypt", "Destination": "/etc/letsencrypt", "RW": False},
            {"Type": "volume", "Name": "frilo_public_uploads", "Destination": "/uploads", "RW": False},
        ]
        self.config["services"]["nginx"]["ports"] = [{"target": 443, "published": "443"}]
        self.containers[2]["HostConfig"]["PortBindings"] = {"443/tcp": [{"HostIp": "", "HostPort": "443"}]}
        self.containers[2]["NetworkSettings"]["Networks"]["smoothiz_prod_smoothiz"] = {"Aliases": ["frilo-nginx"]}

    def run_preflight(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "compose-effective.json").write_text(json.dumps(self.config))
            (root / "containers.json").write_text(json.dumps(self.containers))
            process = subprocess.run([sys.executable, "-", directory, "test"], input=PREFLIGHT, text=True, capture_output=True)
            generated = {}
            if process.returncode == 0:
                generated = {name: json.loads((root / (name + ".json")).read_text()) for name in ("release", "rollback")}
            return process, generated

    def test_preserves_ssl_uploads_and_live_smoothiz_network(self):
        original = copy.deepcopy(self.config)
        result, generated = self.run_preflight()
        self.assertEqual(result.returncode, 0, result.stderr)
        release = generated["release"]
        self.assertEqual(release["services"]["nginx"]["volumes"], original["services"]["nginx"]["volumes"])
        actual_networks = {release["networks"][key]["name"] for key in release["services"]["nginx"]["networks"]}
        self.assertEqual(actual_networks, {"frilo_frilo", "smoothiz_prod_smoothiz"})
        self.assertEqual(release["services"]["backend"]["environment"]["RUN_MIGRATIONS"], "false")
        self.assertEqual(generated["rollback"]["services"]["nginx"]["image"], "frilo-release-nginx:rollback-test")

    def test_refuses_missing_ssl_mount(self):
        self.config["services"]["nginx"]["volumes"].pop(0)
        result, generated = self.run_preflight()
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(generated)

    def test_refuses_changed_bind_address(self):
        self.containers[2]["HostConfig"]["PortBindings"]["443/tcp"][0]["HostIp"] = "127.0.0.1"
        result, _ = self.run_preflight()
        self.assertNotEqual(result.returncode, 0)

    def test_refuses_different_compose_project(self):
        self.config["name"] = "other"
        result, _ = self.run_preflight()
        self.assertNotEqual(result.returncode, 0)

    def test_refuses_static_network_address(self):
        self.containers[2]["NetworkSettings"]["Networks"]["smoothiz_prod_smoothiz"]["IPAMConfig"] = {"IPv4Address": "172.20.0.8"}
        result, _ = self.run_preflight()
        self.assertNotEqual(result.returncode, 0)


if __name__ == "__main__":
    unittest.main()
