<script lang="ts">
	import type { PageData } from './$types';
	import { 
		Users, 
		BookOpen, 
		Building2, 
		FileText, 
		TrendingUp, 
		Clock, 
		AlertTriangle,
		UserPlus,
		Activity,
		ArrowRight
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const stats = $derived(data.stats);
	const recentSubmissions = $derived(data.recentSubmissions);
	const pendingCourses = $derived(data.pendingCourses);
	const recentUsers = $derived(data.recentUsers);

	function formatDate(dateString: string | Date) {
		const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getRoleLabel(role: string) {
		switch (role) {
			case 'ADMIN': return 'Admin';
			case 'HOD': return 'HOD';
			case 'LECTURER': return 'Lecturer';
			default: return role;
		}
	}
</script>

<svelte:head>
	<title>Admin Dashboard - ScoreFlow</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
		<p class="text-gray-600">System overview and management</p>
	</div>

	<!-- Quick Stats -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="p-2 bg-blue-100 rounded-lg">
					<Users class="h-6 w-6 text-blue-600" />
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-500">Total Users</p>
					<p class="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="p-2 bg-green-100 rounded-lg">
					<BookOpen class="h-6 w-6 text-green-600" />
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-500">Total Courses</p>
					<p class="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="p-2 bg-purple-100 rounded-lg">
					<Users class="h-6 w-6 text-purple-600" />
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-500">Total Students</p>
					<p class="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center">
				<div class="p-2 bg-orange-100 rounded-lg">
					<Building2 class="h-6 w-6 text-orange-600" />
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-500">Departments</p>
					<p class="text-2xl font-bold text-gray-900">{stats.totalDepartments}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Activity Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-medium text-gray-900">Recent Activity</h2>
				<Activity class="h-5 w-5 text-gray-400" />
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="text-center p-4 bg-green-50 rounded-lg">
					<p class="text-2xl font-bold text-green-600">{stats.recentSubmissionsCount}</p>
					<p class="text-sm text-gray-600">Submissions (7 days)</p>
				</div>
				<div class="text-center p-4 bg-yellow-50 rounded-lg">
					<p class="text-2xl font-bold text-yellow-600">{stats.pendingCoursesCount}</p>
					<p class="text-sm text-gray-600">Pending Courses</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-medium text-gray-900">Quick Actions</h2>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<a
					href="/admin/courses"
					class="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
				>
					<BookOpen class="h-5 w-5 text-blue-600 mr-2" />
					<span class="text-sm font-medium text-blue-600">Manage Courses</span>
				</a>
				<a
					href="/admin/users"
					class="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
				>
					<Users class="h-5 w-5 text-green-600 mr-2" />
					<span class="text-sm font-medium text-green-600">Manage Users</span>
				</a>
				<a
					href="/admin/reports"
					class="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
				>
					<FileText class="h-5 w-5 text-purple-600 mr-2" />
					<span class="text-sm font-medium text-purple-600">View Reports</span>
				</a>
				<a
					href="/admin/manage"
					class="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
				>
					<Building2 class="h-5 w-5 text-orange-600 mr-2" />
					<span class="text-sm font-medium text-orange-600">System Settings</span>
				</a>
			</div>
		</div>
	</div>

	<!-- Recent Submissions -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
		<div class="bg-white rounded-lg shadow">
			<div class="px-6 py-4 border-b border-gray-200">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-medium text-gray-900">Recent Submissions</h2>
					<a href="/admin/reports" class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
						View all <ArrowRight class="h-4 w-4 ml-1" />
					</a>
				</div>
			</div>
			<div class="p-6">
				{#if recentSubmissions.length > 0}
					<div class="space-y-3">
						{#each recentSubmissions.slice(0, 5) as submission}
							<div class="flex items-center justify-between py-2">
								<div class="flex-1">
									<p class="text-sm font-medium text-gray-900">{submission.course.code}</p>
									<p class="text-xs text-gray-500">{submission.student.name}</p>
								</div>
								<div class="text-right">
									<p class="text-sm text-gray-900">{submission.score || 'N/A'}/30</p>
									<p class="text-xs text-gray-500">{formatDate(submission.updatedAt)}</p>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-gray-500 text-center py-4">No recent submissions</p>
				{/if}
			</div>
		</div>

		<div class="bg-white rounded-lg shadow">
			<div class="px-6 py-4 border-b border-gray-200">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-medium text-gray-900">Courses Pending Submission</h2>
					<a href="/admin/courses" class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
						Manage <ArrowRight class="h-4 w-4 ml-1" />
					</a>
				</div>
			</div>
			<div class="p-6">
				{#if pendingCourses.length > 0}
					<div class="space-y-3">
						{#each pendingCourses.slice(0, 5) as course}
							<div class="flex items-center justify-between py-2">
								<div class="flex-1">
									<p class="text-sm font-medium text-gray-900">{course.code}</p>
									<p class="text-xs text-gray-500">{course.department.name}</p>
								</div>
								<div class="text-right">
									<p class="text-sm text-gray-900">
										{course.courseAssignments[0]?.user?.name || 'Unassigned'}
									</p>
									<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
										<Clock class="h-3 w-3 mr-1" />
										Pending
									</span>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-gray-500 text-center py-4">All courses have submissions</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Recent Users -->
	<div class="bg-white rounded-lg shadow">
		<div class="px-6 py-4 border-b border-gray-200">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-medium text-gray-900">Recently Added Users</h2>
				<a href="/admin/users" class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
					Manage users <ArrowRight class="h-4 w-4 ml-1" />
				</a>
			</div>
		</div>
		<div class="p-6">
			{#if recentUsers.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each recentUsers as user}
						<div class="flex items-center p-3 bg-gray-50 rounded-lg">
							<div class="p-2 bg-blue-100 rounded-lg mr-3">
								<Users class="h-4 w-4 text-blue-600" />
							</div>
							<div class="flex-1">
								<p class="text-sm font-medium text-gray-900">{user.name}</p>
								<p class="text-xs text-gray-500">{getRoleLabel(user.role)} • {user.department?.name || 'No department'}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-500 text-center py-4">No recently added users</p>
			{/if}
		</div>
	</div>
</div>
