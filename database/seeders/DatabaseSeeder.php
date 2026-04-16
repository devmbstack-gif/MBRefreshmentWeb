<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Item;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@company.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        $employeeData = [
            ['Ali Hassan',    'ali@company.com',    'EMP-001', 'Engineering', 'Flutter Developer'],
            ['Sara Khan',     'sara@company.com',   'EMP-002', 'Design',      'UI Designer'],
            ['Usman Raza',    'usman@company.com',  'EMP-003', 'HR',          'HR Manager'],
            ['Fatima Malik',  'fatima@company.com', 'EMP-004', 'Engineering', 'Backend Developer'],
            ['Bilal Ahmed',   'bilal@company.com',  'EMP-005', 'Management',  'Project Manager'],
        ];

        foreach ($employeeData as [$name, $email, $code, $dept, $designation]) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'employee',
                'is_active' => true,
            ]);

            Employee::create([
                'user_id' => $user->id,
                'employee_code' => $code,
                'department' => $dept,
                'designation' => $designation,
                'joining_date' => now()->subMonths(rand(1, 24))->format('Y-m-d'),
            ]);
        }

        $itemsData = [
            ['Lunch',      'food',     'Daily lunch meal',        120, 20],
            ['Green Tea',  'beverage', 'Hot green tea',            85, 15],
            ['Chocolate',  'snack',    'Chocolate bar',            64, 10],
            ['Soft Can',   'beverage', '330ml soft drink can',     48, 12],
            ['Biscuits',   'snack',    'Assorted biscuit pack',    36, 8],
        ];

        foreach ($itemsData as [$name, $category, $description, $stockQuantity, $lowStockThreshold]) {
            Item::create([
                'name' => $name,
                'category' => $category,
                'description' => $description,
                'stock_quantity' => $stockQuantity,
                'low_stock_threshold' => $lowStockThreshold,
                'is_active' => true,
            ]);
        }
    }
}
