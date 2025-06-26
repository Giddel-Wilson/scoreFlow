<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Users, Plus, Trash2, Filter, Search, UserPlus, AlertCircle, CheckCircle } from 'lucide-svelte';

	export let data: PageData;
	export let form: ActionData;

	$: users = data.users;
	$: departments = data.departments;
	$: filters = data.filters;

	let showCreateModal = false;
	let userToDelete: any = null;
	let creating = false;
	let deleting = false;

	function updateFilter(key: string, value: string) {
		const url = new URL($page.url);
		if (value) {
			url.searchParams.set(key, value);
		} else {
			url.searchParams.delete(key);
		}
		goto(url);
	}

	function clearFilters() {
		goto('/admin/users');
	}

	function getRoleBadge(role: string) {
		switch (role) {
			case 'ADMIN':
				return 'bg-red-100 text-red-800';
			case 'HOD':
				return 'bg-blue-100 text-blue-800';
			case 'LECTURER':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function confirmDelete(user: any) {
		userToDelete = user;
	}

	function cancelDelete() {
		userToDelete = null;
	}
</script>

<svelte:head>
	<title>Manage Users - ScoreFlow</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex justify-between items-center">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">User Management</h1>
				<p class="mt-2 text-gray-600">
					Create and manage user accounts across the system
				</p>
			</div>
			<button
				onclick={() => showCreateModal = true}
				class="btn btn-primary"
			>
				<UserPlus class="h-4 w-4 mr-2" />
				Add User
			</button>
		</div>
	</div>

	<!-- Form Messages -->
	{#if form?.success}
		<div class="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
			<div class="flex">
				<CheckCircle class="h-5 w-5 text-green-400" />
				<div class="ml-3">
					<p class="text-sm font-medium text-green-800">
						{form.message}
					</p>
				</div>
			</div>
		</div>
	{/if}

	{#if form?.error}
		<div class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
			<div class="flex">
				<AlertCircle class="h-5 w-5 text-red-400" />
				<div class="ml-3">
					<p class="text-sm font-medium text-red-800">
						{form.error}
					</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Stats -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
		<div class="bg-white overflow-hidden shadow rounded-lg">
			<div class="p-5">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="bg-blue-500 rounded-md p-3">
							<Users class="h-6 w-6 text-white" />
						</div>
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
							<dd class="text-lg font-medium text-gray-900">{users.length}</dd>
						</dl>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-white overflow-hidden shadow rounded-lg">
			<div class="p-5">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="bg-red-500 rounded-md p-3">
							<Users class="h-6 w-6 text-white" />
						</div>
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">Admins</dt>
							<dd class="text-lg font-medium text-gray-900">
								{users.filter(u => u.role === 'ADMIN').length}
							</dd>
						</dl>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-white overflow-hidden shadow rounded-lg">
			<div class="p-5">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="bg-blue-500 rounded-md p-3">
							<Users class="h-6 w-6 text-white" />
						</div>
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">HODs</dt>
							<dd class="text-lg font-medium text-gray-900">
								{users.filter(u => u.role === 'HOD').length}
							</dd>
						</dl>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-white overflow-hidden shadow rounded-lg">
			<div class="p-5">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="bg-green-500 rounded-md p-3">
							<Users class="h-6 w-6 text-white" />
						</div>
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">Lecturers</dt>
							<dd class="text-lg font-medium text-gray-900">
								{users.filter(u => u.role === 'LECTURER').length}
							</dd>
						</dl>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="bg-white shadow rounded-lg mb-6">
		<div class="px-4 py-5 sm:p-6">
			<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
				<Filter class="inline h-5 w-5 mr-2" />
				Filters
			</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="role" class="block text-sm font-medium text-gray-700">Role</label>
					<select
						id="role"
						value={filters.role || ''}
						onchange={(e) => updateFilter('role', e.currentTarget.value)}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					>
						<option value="">All Roles</option>
						<option value="ADMIN">Admin</option>
						<option value="HOD">HOD</option>
						<option value="LECTURER">Lecturer</option>
					</select>
				</div>

				<div>
					<label for="department" class="block text-sm font-medium text-gray-700">Department</label>
					<select
						id="department"
						value={filters.department || ''}
						onchange={(e) => updateFilter('department', e.currentTarget.value)}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					>
						<option value="">All Departments</option>
						{#each departments as department}
							<option value={department.id}>{department.name}</option>
						{/each}
					</select>
				</div>
			</div>

			{#if filters.role || filters.department}
				<div class="mt-4">
					<button
						onclick={clearFilters}
						class="btn btn-secondary"
					>
						Clear Filters
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Users Table -->
	<div class="bg-white shadow overflow-hidden sm:rounded-md">
		<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
			<h3 class="text-lg leading-6 font-medium text-gray-900">
				System Users
			</h3>
			<p class="mt-1 max-w-2xl text-sm text-gray-500">
				All registered users in the system
			</p>
		</div>

		{#if users.length === 0}
			<div class="text-center py-12">
				<Search class="mx-auto h-12 w-12 text-gray-400" />
				<h3 class="mt-2 text-sm font-medium text-gray-900">No users found</h3>
				<p class="mt-1 text-sm text-gray-500">
					Try adjusting your filters to see more results.
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Name
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Email
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Role
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Department
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each users as user}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">{user.name}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">{user.email}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getRoleBadge(user.role)}">
										{user.role}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{user.department?.name || '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<button
										onclick={() => confirmDelete(user)}
										class="text-red-600 hover:text-red-900"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Create User Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
			<form 
				method="POST" 
				action="?/create"
				use:enhance={() => {
					creating = true;
					return async ({ update }) => {
						creating = false;
						await update();
						if (form?.success) {
							showCreateModal = false;
						}
					};
				}}
			>
				<div class="mb-4">
					<h3 class="text-lg font-medium text-gray-900">Create New User</h3>
				</div>

				<div class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							value={form?.name || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							required
							value={form?.email || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
						<input
							type="password"
							id="password"
							name="password"
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						/>
					</div>

					<div>
						<label for="role" class="block text-sm font-medium text-gray-700">Role</label>
						<select
							id="role"
							name="role"
							required
							value={form?.role || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						>
							<option value="">Select Role</option>
							<option value="ADMIN">Admin</option>
							<option value="HOD">HOD</option>
							<option value="LECTURER">Lecturer</option>
						</select>
					</div>

					<div>
						<label for="departmentId" class="block text-sm font-medium text-gray-700">Department</label>
						<select
							id="departmentId"
							name="departmentId"
							value={form?.departmentId || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						>
							<option value="">No Department</option>
							{#each departments as department}
								<option value={department.id}>{department.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="flex justify-end space-x-3 mt-6">
					<button
						type="button"
						onclick={() => showCreateModal = false}
						class="btn btn-secondary"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={creating}
						class="btn btn-primary"
					>
						{#if creating}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						{:else}
							<Plus class="h-4 w-4 mr-2" />
						{/if}
						Create User
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if userToDelete}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
			<div class="mb-4">
				<h3 class="text-lg font-medium text-gray-900">Confirm Delete</h3>
				<p class="mt-2 text-sm text-gray-600">
					Are you sure you want to delete <strong>{userToDelete.name}</strong>? This action cannot be undone.
				</p>
			</div>

			<form 
				method="POST" 
				action="?/delete"
				use:enhance={() => {
					deleting = true;
					return async ({ update }) => {
						deleting = false;
						await update();
						if (form?.success) {
							userToDelete = null;
						}
					};
				}}
			>
				<input type="hidden" name="userId" value={userToDelete.id} />
				
				<div class="flex justify-end space-x-3">
					<button
						type="button"
						onclick={cancelDelete}
						class="btn btn-secondary"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={deleting}
						class="btn btn-danger"
					>
						{#if deleting}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						{:else}
							<Trash2 class="h-4 w-4 mr-2" />
						{/if}
						Delete User
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
