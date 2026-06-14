<?php

namespace App\Enums;

enum CashEntryType: string
{
    case Income  = 'income';
    case Expense = 'expense';
}
