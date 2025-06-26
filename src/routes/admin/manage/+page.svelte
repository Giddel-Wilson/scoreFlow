<script lang="ts">
	import type { PageData } from './$types';
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { 
		Users, 
		BookOpen, 
		Activity, 
		BarChart3, 
		Plus, 
		Search, 
		Download,
		Trash2,
		Eye,
		Filter,
		Calendar,
		User,
		Building,
		GraduationCap,
		AlertTriangle
	} from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showCreateUserModal = $state(false);
	let showCreateCourseModal = $state(false);
	let deleteUserId: number | null = $state(null);
	let deleteCourseId: number | null = $state(null);

	// Filter values
	let userRoleFilter = $state(data.filters?.role || '');
	let userDepartmentFilter = $state(data.filters?.department || '');
	let courseLevel = $state(data.filters?.level || '');
	let courseSemester = $state(data.filters?.semester || '');
	let courseDepartment = $state(data.filters?.department || '');
	let auditUser = $state(data.filters?.user || '');
	let auditAction = $state(data.filters?.action || '');
	let auditStartDate = $state(data.filters?.startDate || '');
	let auditEndDate = $state(data.filters?.endDate || '');

	function switchTab(tab: string) {
		const url = new URL($page.url);
		url.searchParams.set('tab', tab);
		goto(url.toString());
	}

	function applyFilters(tab: string) {
		const url = new URL($page.url);
		url.searchParams.set('tab', tab);
		
		if (tab === 'users') {
			if (userRoleFilter) url.searchParams.set('role', userRoleFilter);
			else url.searchParams.delete('role');
			if (userDepartmentFilter) url.searchParams.set('department', userDepartmentFilter);
			else url.searchParams.delete('department');
		} else if (tab === 'courses') {
			if (courseLevel) url.searchParams.set('level', courseLevel);
			else url.searchParams.delete('level');
			if (courseSemester) url.searchParams.set('semester', courseSemester);
			else url.searchParams.delete('semester');
			if (courseDepartment) url.searchParams.set('department', courseDepartment);
			else url.searchParams.delete('department');
		} else if (tab === 'audit') {
			if (auditUser) url.searchParams.set('user', auditUser);
			else url.searchParams.delete('user');
			if (auditAction) url.searchParams.set('action', auditAction);
			else url.searchParams.delete('action');
			if (auditStartDate) url.searchParams.set('startDate', auditStartDate);
			else url.searchParams.delete('startDate');
			if (auditEndDate) url.searchParams.set('endDate', auditEndDate);
			else url.searchParams.delete('endDate');
		}
		
		goto(url.toString());
	}

	function exportAuditLogs() {
		const headers = ['Timestamp', 'User', 'Role', 'Action'];
		const rows = data.auditLogs?.map((log: any) => [
			new Date(log.timestamp).toLocaleString(),
			log.user?.name || 'Unknown',
			log.user?.role || 'Unknown',
			log.action || ''
		]) || [];

		const csvContent = [headers, ...rows]
			.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(','))
			.join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	}

	function getStatusBadge(status: string) {
		switch (status) {
			case 'SUBMITTED': return 'bg-green-100 text-green-800';
			case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getRoleBadge(role: string) {
		switch (role) {
			case 'ADMIN': return 'bg-red-100 text-red-800';
			case 'HOD': return 'bg-blue-100 text-blue-800';
			case 'LECTURER': return 'bg-green-100 text-green-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<svelte:head>
	<title>Administration - ScoreFlow</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="py-6">
				<h1 class="text-3xl font-bold text-gray-900">Administration</h1>
				<p class="mt-2 text-sm text-gray-600">
					Manage users, courses, and system settings in detail
				</p>
			</div>
		</div>
	</div>

	<!-- Tab Navigation -->
	<div class="bg-white border-b">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<nav class="flex space-x-8">
				<button
					onclick={() => switchTab('users')}
					class="flex items-center py-4 px-1 border-b-2 font-medium text-sm"
					class:border-blue-500={data.activeTab === 'users'}
					class:text-blue-600={data.activeTab === 'users'}
					class:border-transparent={data.activeTab !== 'users'}
					class:text-gray-500={data.activeTab !== 'users'}
				>
					<Users class="h-5 w-5 mr-2" />
					User Management
				</button>
				<button
					onclick={() => switchTab('courses')}
					class="flex items-center py-4 px-1 border-b-2 font-medium text-sm"
					class:border-blue-500={data.activeTab === 'courses'}
					class:text-blue-600={data.activeTab === 'courses'}
					class:border-transparent={data.activeTab !== 'courses'}
					class:text-gray-500={data.activeTab !== 'courses'}
				>
					<BookOpen class="h-5 w-5 mr-2" />
					Course Management
				</button>
				<button
					onclick={() => switchTab('audit')}
					class="flex items-center py-4 px-1 border-b-2 font-medium text-sm"
					class:border-blue-500={data.activeTab === 'audit'}
					class:text-blue-600={data.activeTab === 'audit'}
					class:border-transparent={data.activeTab !== 'audit'}
					class:text-gray-500={data.activeTab !== 'audit'}
				>
					<Activity class="h-5 w-5 mr-2" />
					Audit Logs
				</button>
				<button
					onclick={() => switchTab('reports')}
					class="flex items-center py-4 px-1 border-b-2 font-medium text-sm"
					class:border-blue-500={data.activeTab === 'reports'}
					class:text-blue-600={data.activeTab === 'reports'}
					class:border-transparent={data.activeTab !== 'reports'}
					class:text-gray-500={data.activeTab !== 'reports'}
				>
					<BarChart3 class="h-5 w-5 mr-2" />
					System Reports
				</button>
			</nav>
		</div>
	</div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if form?.error}
			<div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
				{form.error}
			</div>
		{/if}

		{#if form?.success}
			<div class="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
				{form.success}
			</div>
		{/if}

		<!-- Users Tab -->
		{#if data.activeTab === 'users'}
			<div class="space-y-6">
				<!-- Header with Create Button -->
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-gray-900">User Management</h2>
					<button
						onclick={() => showCreateUserModal = true}
						class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
					>
						<Plus class="h-4 w-4 mr-2" />
						Create User
					</button>
				</div>

				<!-- Filters -->
				<div class="bg-white p-4 rounded-lg shadow">
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label for="userRoleFilter" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
							<select id="userRoleFilter" bind:value={userRoleFilter} class="input">
								<option value="">All Roles</option>
								<option value="ADMIN">Admin</option>
								<option value="HOD">HOD</option>
								<option value="LECTURER">Lecturer</option>
							</select>
						</div>
						<div>
							<label for="userDepartmentFilter" class="block text-sm font-medium text-gray-700 mb-1">Department</label>
							<select id="userDepartmentFilter" bind:value={userDepartmentFilter} class="input">
								<option value="">All Departments</option>
								{#each data.departments || [] as department}
									<option value={department.id}>{department.name}</option>
								{/each}
							</select>
						</div>
						<div class="flex items-end">
							<button
								onclick={() => applyFilters('users')}
								class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
							>
								<Filter class="h-4 w-4 mr-2" />
								Apply Filters
							</button>
						</div>
					</div>
				</div>

				<!-- Users Table -->
				<div class="bg-white shadow rounded-lg overflow-hidden">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each data.users || [] as user}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<div class="text-sm font-medium text-gray-900">{user.name}</div>
											<div class="text-sm text-gray-500">{user.email}</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getRoleBadge(user.role)}">
											{user.role}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{user.department?.name || 'N/A'}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<button
											onclick={() => deleteUserId = user.id}
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
			</div>
		{/if}

		<!-- Courses Tab -->
		{#if data.activeTab === 'courses'}
			<div class="space-y-6">
				<!-- Header with Create Button -->
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-gray-900">Course Management</h2>
					<button
						onclick={() => showCreateCourseModal = true}
						class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
					>
						<Plus class="h-4 w-4 mr-2" />
						Create Course
					</button>
				</div>

				<!-- Filters -->
				<div class="bg-white p-4 rounded-lg shadow">
					<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<label for="courseLevel" class="block text-sm font-medium text-gray-700 mb-1">Level</label>
							<select id="courseLevel" bind:value={courseLevel} class="input">
								<option value="">All Levels</option>
								<option value="100">100 Level</option>
								<option value="200">200 Level</option>
								<option value="300">300 Level</option>
								<option value="400">400 Level</option>
							</select>
						</div>
						<div>
							<label for="courseSemester" class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
							<select id="courseSemester" bind:value={courseSemester} class="input">
								<option value="">All Semesters</option>
								<option value="1">First Semester</option>
								<option value="2">Second Semester</option>
							</select>
						</div>
						<div>
							<label for="courseDepartment" class="block text-sm font-medium text-gray-700 mb-1">Department</label>
							<select id="courseDepartment" bind:value={courseDepartment} class="input">
								<option value="">All Departments</option>
								{#each data.departments || [] as department}
									<option value={department.id}>{department.name}</option>
								{/each}
							</select>
						</div>
						<div class="flex items-end">
							<button
								onclick={() => applyFilters('courses')}
								class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
							>
								<Filter class="h-4 w-4 mr-2" />
								Apply Filters
							</button>
						</div>
					</div>
				</div>

				<!-- Courses Table -->
				<div class="bg-white shadow rounded-lg overflow-hidden">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level/Semester</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each data.courses || [] as course}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<div class="text-sm font-medium text-gray-900">{course.code}</div>
											<div class="text-sm text-gray-500">{course.title}</div>
											<div class="text-xs text-gray-400">{course.creditUnits} units</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{course.level} Level / Semester {course.semester}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{course.department?.name}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<button
											onclick={() => deleteCourseId = course.id}
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
			</div>
		{/if}

		<!-- Audit Logs Tab -->
		{#if data.activeTab === 'audit'}
			<div class="space-y-6">
				<!-- Header with Export Button -->
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-gray-900">Audit Logs</h2>
					<button
						onclick={exportAuditLogs}
						class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
					>
						<Download class="h-4 w-4 mr-2" />
						Export CSV
					</button>
				</div>

				<!-- Filters -->
				<div class="bg-white p-4 rounded-lg shadow">
					<div class="grid grid-cols-1 md:grid-cols-5 gap-4">
						<div>
							<label for="auditUser" class="block text-sm font-medium text-gray-700 mb-1">User</label>
							<select id="auditUser" bind:value={auditUser} class="input">
								<option value="">All Users</option>
								{#each data.users || [] as user}
									<option value={user.id}>{user.name}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="auditAction" class="block text-sm font-medium text-gray-700 mb-1">Action</label>
							<select id="auditAction" bind:value={auditAction} class="input">
								<option value="">All Actions</option>
								<option value="LOGIN">Login</option>
								<option value="LOGOUT">Logout</option>
								<option value="CREATE_USER">Create User</option>
								<option value="DELETE_USER">Delete User</option>
								<option value="CREATE_COURSE">Create Course</option>
								<option value="DELETE_COURSE">Delete Course</option>
								<option value="SUBMIT_SCORES">Submit Scores</option>
								<option value="UPDATE_SCORES">Update Scores</option>
							</select>
						</div>
						<div>
							<label for="auditStartDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
							<input id="auditStartDate" type="date" bind:value={auditStartDate} class="input" />
						</div>
						<div>
							<label for="auditEndDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
							<input id="auditEndDate" type="date" bind:value={auditEndDate} class="input" />
						</div>
						<div class="flex items-end">
							<button
								onclick={() => applyFilters('audit')}
								class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
							>
								<Filter class="h-4 w-4 mr-2" />
								Apply Filters
							</button>
						</div>
					</div>
				</div>

				<!-- Audit Logs Table -->
				<div class="bg-white shadow rounded-lg overflow-hidden">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each data.auditLogs || [] as log}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{new Date(log.timestamp).toLocaleString()}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<div class="text-sm font-medium text-gray-900">{log.user?.name || 'Unknown'}</div>
											<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getRoleBadge(log.user?.role || 'UNKNOWN')}">
												{log.user?.role || 'Unknown'}
											</span>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
											{log.action}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Reports Tab -->
		{#if data.activeTab === 'reports'}
			<div class="space-y-6">
				<h2 class="text-xl font-semibold text-gray-900">System Reports</h2>

				<!-- System Statistics -->
				<div class="grid grid-cols-1 md:grid-cols-5 gap-6">
					<div class="bg-white overflow-hidden shadow rounded-lg">
						<div class="p-5">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<Users class="h-6 w-6 text-gray-400" />
								</div>
								<div class="ml-5 w-0 flex-1">
									<dl>
										<dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
										<dd class="text-lg font-medium text-gray-900">{data.systemStats?.totalUsers || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					<div class="bg-white overflow-hidden shadow rounded-lg">
						<div class="p-5">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<BookOpen class="h-6 w-6 text-gray-400" />
								</div>
								<div class="ml-5 w-0 flex-1">
									<dl>
										<dt class="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
										<dd class="text-lg font-medium text-gray-900">{data.systemStats?.totalCourses || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					<div class="bg-white overflow-hidden shadow rounded-lg">
						<div class="p-5">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<GraduationCap class="h-6 w-6 text-gray-400" />
								</div>
								<div class="ml-5 w-0 flex-1">
									<dl>
										<dt class="text-sm font-medium text-gray-500 truncate">Total Students</dt>
										<dd class="text-lg font-medium text-gray-900">{data.systemStats?.totalStudents || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					<div class="bg-white overflow-hidden shadow rounded-lg">
						<div class="p-5">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<BarChart3 class="h-6 w-6 text-gray-400" />
								</div>
								<div class="ml-5 w-0 flex-1">
									<dl>
										<dt class="text-sm font-medium text-gray-500 truncate">Submitted Scores</dt>
										<dd class="text-lg font-medium text-gray-900">{data.systemStats?.submittedScores || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					<div class="bg-white overflow-hidden shadow rounded-lg">
						<div class="p-5">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<Activity class="h-6 w-6 text-gray-400" />
								</div>
								<div class="ml-5 w-0 flex-1">
									<dl>
										<dt class="text-sm font-medium text-gray-500 truncate">Audit Entries</dt>
										<dd class="text-lg font-medium text-gray-900">{data.systemStats?.auditEntries || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Department Reports -->
				<div class="bg-white shadow rounded-lg">
					<div class="px-6 py-4 border-b border-gray-200">
						<h3 class="text-lg leading-6 font-medium text-gray-900">Department Overview</h3>
					</div>
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted Scores</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								{#each data.departments || [] as department}
									<tr>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="flex items-center">
												<Building class="h-5 w-5 text-gray-400 mr-3" />
												<div class="text-sm font-medium text-gray-900">{department.name}</div>
											</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{department.users?.length || 0}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{department.courses?.length || 0}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Create User Modal -->
{#if showCreateUserModal}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full">
			<form method="POST" action="?/createUser" use:enhance>
				<div class="px-6 py-4 border-b border-gray-200">
					<h3 class="text-lg font-medium text-gray-900">Create New User</h3>
				</div>
				<div class="px-6 py-4 space-y-4">
					<div>
						<label for="userName" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
						<input id="userName" type="text" name="name" required class="input" />
					</div>
					<div>
						<label for="userEmail" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input id="userEmail" type="email" name="email" required class="input" />
					</div>
					<div>
						<label for="userPassword" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
						<input id="userPassword" type="password" name="password" required class="input" />
					</div>
					<div>
						<label for="userRole" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
						<select id="userRole" name="role" required class="input">
							<option value="">Select Role</option>
							<option value="ADMIN">Admin</option>
							<option value="HOD">HOD</option>
							<option value="LECTURER">Lecturer</option>
						</select>
					</div>
					<div>
						<label for="userDepartmentId" class="block text-sm font-medium text-gray-700 mb-1">Department</label>
						<select id="userDepartmentId" name="departmentId" class="input">
							<option value="">No Department</option>
							{#each data.departments || [] as department}
								<option value={department.id}>{department.name}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
					<button
						type="button"
						onclick={() => showCreateUserModal = false}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
					>
						Create User
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Create Course Modal -->
{#if showCreateCourseModal}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full">
			<form method="POST" action="?/createCourse" use:enhance>
				<div class="px-6 py-4 border-b border-gray-200">
					<h3 class="text-lg font-medium text-gray-900">Create New Course</h3>
				</div>
				<div class="px-6 py-4 space-y-4">
					<div>
						<label for="courseCode" class="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
						<input id="courseCode" type="text" name="code" required class="input" placeholder="e.g., CSC 101" />
					</div>
					<div>
						<label for="courseTitle" class="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
						<input id="courseTitle" type="text" name="title" required class="input" />
					</div>
					<div>
						<label for="courseCreditUnits" class="block text-sm font-medium text-gray-700 mb-1">Credit Units</label>
						<input id="courseCreditUnits" type="number" name="creditUnits" required min="1" max="6" class="input" />
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="courseLevelSelect" class="block text-sm font-medium text-gray-700 mb-1">Level</label>
							<select id="courseLevelSelect" name="level" required class="input">
								<option value="">Select Level</option>
								<option value="100">100 Level</option>
								<option value="200">200 Level</option>
								<option value="300">300 Level</option>
								<option value="400">400 Level</option>
							</select>
						</div>
						<div>
							<label for="courseSemesterSelect" class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
							<select id="courseSemesterSelect" name="semester" required class="input">
								<option value="">Select Semester</option>
								<option value="1">First Semester</option>
								<option value="2">Second Semester</option>
							</select>
						</div>
					</div>
					<div>
						<label for="courseDepartmentSelect" class="block text-sm font-medium text-gray-700 mb-1">Department</label>
						<select id="courseDepartmentSelect" name="departmentId" required class="input">
							<option value="">Select Department</option>
							{#each data.departments || [] as department}
								<option value={department.id}>{department.name}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
					<button
						type="button"
						onclick={() => showCreateCourseModal = false}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
					>
						Create Course
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete User Confirmation -->
{#if deleteUserId}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full">
			<form method="POST" action="?/deleteUser" use:enhance>
				<input type="hidden" name="userId" value={deleteUserId} />
				<div class="px-6 py-4">
					<div class="flex items-center">
						<AlertTriangle class="h-6 w-6 text-red-600 mr-3" />
						<h3 class="text-lg font-medium text-gray-900">Delete User</h3>
					</div>
					<p class="mt-2 text-sm text-gray-500">
						Are you sure you want to delete this user? This action cannot be undone.
					</p>
				</div>
				<div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
					<button
						type="button"
						onclick={() => deleteUserId = null}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
					>
						Delete
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Course Confirmation -->
{#if deleteCourseId}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full">
			<form method="POST" action="?/deleteCourse" use:enhance>
				<input type="hidden" name="courseId" value={deleteCourseId} />
				<div class="px-6 py-4">
					<div class="flex items-center">
						<AlertTriangle class="h-6 w-6 text-red-600 mr-3" />
						<h3 class="text-lg font-medium text-gray-900">Delete Course</h3>
					</div>
					<p class="mt-2 text-sm text-gray-500">
						Are you sure you want to delete this course? This will also delete all associated scores.
					</p>
				</div>
				<div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
					<button
						type="button"
						onclick={() => deleteCourseId = null}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
					>
						Delete
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
