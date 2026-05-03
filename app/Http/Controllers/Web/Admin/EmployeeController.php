<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    private function employeeValidationRules(?Employee $employee = null): array
    {
        return [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,'.($employee?->user_id ?? 'NULL'),
            'password' => $employee
                ? ['nullable', Password::min(8)]
                : ['required', Password::min(8)],
            'employee_code' => 'required|string|max:50|unique:employees,employee_code,'.($employee?->id ?? 'NULL'),
            'department' => 'nullable|string|max:100',
            'designation' => 'nullable|string|max:100',
            'personal_email' => 'nullable|email|max:150',
            'joining_date' => 'nullable|date',
            'avatar' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
        ];
    }

    private function employeeValidationMessages(): array
    {
        return [
            'avatar.file' => 'Please upload a valid file.',
            'avatar.mimes' => 'Employee image must be a JPG, JPEG, PNG, or WEBP file.',
            'avatar.max' => 'Employee image size must not be greater than 2MB.',
        ];
    }

    public function index(): Response
    {
        $employees = Employee::with('user')
            ->latest()
            ->get()
            ->map(fn ($employee) => [
                'id' => $employee->id,
                'user_id' => $employee->user_id,
                'name' => $employee->user->name,
                'email' => $employee->user->email,
                'shareable_password' => $employee->user->shareable_password,
                'avatar' => $employee->user->avatar,
                'employee_code' => $employee->employee_code,
                'department' => $employee->department,
                'designation' => $employee->designation,
                'personal_email' => $employee->personal_email,
                'joining_date' => $employee->joining_date?->format('Y-m-d'),
                'is_active' => $employee->user->is_active,
            ]);

        return Inertia::render('admin/employees', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate($this->employeeValidationRules(), $this->employeeValidationMessages());

        DB::transaction(function () use ($request) {
            $avatar = $request->file('avatar')
                ? '/storage/'.$request->file('avatar')->store('avatars', 'public')
                : null;

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
                'shareable_password' => $request->password,
                'role' => 'employee',
                'avatar' => $avatar,
                'is_active' => true,
            ]);

            Employee::create([
                'user_id' => $user->id,
                'employee_code' => $request->employee_code,
                'department' => $request->department,
                'designation' => $request->designation,
                'personal_email' => $request->personal_email,
                'joining_date' => $request->joining_date,
            ]);
        });

        return redirect()->route('admin.employees.index')->with('success', 'Employee account created successfully.');
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $request->validate($this->employeeValidationRules($employee), $this->employeeValidationMessages());

        DB::transaction(function () use ($request, $employee) {
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if ($request->filled('password')) {
                $userData['password'] = $request->password;
                $userData['shareable_password'] = $request->password;
            }

            if ($request->file('avatar')) {
                if ($employee->user->avatar) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $employee->user->avatar));
                }

                $userData['avatar'] = '/storage/'.$request->file('avatar')->store('avatars', 'public');
            }

            $employee->user->update($userData);

            $employee->update([
                'employee_code' => $request->employee_code,
                'department' => $request->department,
                'designation' => $request->designation,
                'personal_email' => $request->personal_email,
                'joining_date' => $request->joining_date,
            ]);
        });

        return redirect()->route('admin.employees.index')->with('success', 'Employee updated successfully.');
    }

    public function toggleStatus(Employee $employee): RedirectResponse
    {
        $employee->user->update([
            'is_active' => ! $employee->user->is_active,
        ]);

        $status = $employee->user->is_active ? 'activated' : 'deactivated';

        return redirect()->route('admin.employees.index')->with('success', "Employee {$status} successfully.");
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        if ($employee->user->is_active) {
            return redirect()->route('admin.employees.index')->with('error', 'Please deactivate the employee before deleting the account.');
        }

        DB::transaction(function () use ($employee) {
            if ($employee->user->avatar) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $employee->user->avatar));
            }

            DB::table('quota_usages')->where('employee_id', $employee->id)->delete();
            DB::table('meal_order_requests')->where('employee_id', $employee->id)->delete();
            DB::table('employee_quotas')->where('employee_id', $employee->id)->delete();

            $user = $employee->user;

            $employee->delete();
            $user->delete();
        });

        return redirect()->route('admin.employees.index')->with('success', 'Employee deleted successfully.');
    }
}
