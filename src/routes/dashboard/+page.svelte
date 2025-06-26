<script lang="ts">
	import type { PageData } from './$types';
	import { BookOpen, Users, FileText, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const user = $derived(data.user);
	const stats = $derived(data.stats);

	function getGreeting() {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 17) return 'Good afternoon';
		return 'Good evening';
	}

	// Type guards
	function isLecturerStats(stats: any): stats is { totalCourses: number; submittedCourses: number; pendingCourses: number; totalStudents: number } {
		return 'submittedCourses' in stats && 'totalStudents' in stats;
	}

	function isHODStats(stats: any): stats is { totalCourses: number; coursesWithSubmissions: number; pendingCourses: number; totalLecturers: number } {
		return 'coursesWithSubmissions' in stats && 'totalLecturers' in stats;
	}

	function isAdminStats(stats: any): stats is { totalUsers: number; totalCourses: number; totalDepartments: number; totalStudents: number } {
		return 'totalUsers' in stats && 'totalDepartments' in stats;
	}

	function getStatsCards() {
		if (user.role === 'LECTURER' && isLecturerStats(stats)) {
			return [
				{
					title: 'Total Courses',
					value: stats.totalCourses,
					icon: BookOpen,
					color: 'bg-blue-500'
				},
				{
					title: 'Submitted',
					value: stats.submittedCourses,
					icon: CheckCircle,
					color: 'bg-green-500'
				},
				{
					title: 'Pending',
					value: stats.pendingCourses,
					icon: Clock,
					color: 'bg-yellow-500'
				},
				{
					title: 'Total Students',
					value: stats.totalStudents,
					icon: Users,
					color: 'bg-purple-500'
				}
			];
		} else if (user.role === 'HOD' && isHODStats(stats)) {
			return [
				{
					title: 'Department Courses',
					value: stats.totalCourses,
					icon: BookOpen,
					color: 'bg-blue-500'
				},
				{
					title: 'Submitted Courses',
					value: stats.coursesWithSubmissions,
					icon: CheckCircle,
					color: 'bg-green-500'
				},
				{
					title: 'Pending Courses',
					value: stats.pendingCourses,
					icon: Clock,
					color: 'bg-yellow-500'
				},
				{
					title: 'Active Lecturers',
					value: stats.totalLecturers,
					icon: Users,
					color: 'bg-purple-500'
				}
			];
		} else if (user.role === 'ADMIN' && isAdminStats(stats)) {
			return [
				{
					title: 'Total Users',
					value: stats.totalUsers,
					icon: Users,
					color: 'bg-blue-500'
				},
				{
					title: 'Total Courses',
					value: stats.totalCourses,
					icon: BookOpen,
					color: 'bg-green-500'
				},
				{
					title: 'Departments',
					value: stats.totalDepartments,
					icon: TrendingUp,
					color: 'bg-yellow-500'
				},
				{
					title: 'Students',
					value: stats.totalStudents,
					icon: FileText,
					color: 'bg-purple-500'
				}
			];
		}
		
		// Fallback for unknown role
		return [];
	}

	const statsCards = $derived(getStatsCards());
</script>

<svelte:head>
	<title>Dashboard - ScoreFlow</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">
			{getGreeting()}, {user.name}!
		</h1>
		<p class="mt-2 text-gray-600">
			Welcome to your ScoreFlow dashboard
			{#if user.department}
				- {user.department.name}
			{/if}
		</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		{#each statsCards as card}
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="{card.color} rounded-md p-3">
								<svelte:component this={card.icon} class="h-6 w-6 text-white" />
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">
									{card.title}
								</dt>
								<dd class="text-lg font-medium text-gray-900">
									{card.value}
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Quick Actions -->
	<div class="bg-white shadow rounded-lg">
		<div class="px-4 py-5 sm:p-6">
			<h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
				Quick Actions
			</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#if user.role === 'LECTURER'}
					<a
						href="/lecturer/courses"
						class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<div class="flex-shrink-0">
							<BookOpen class="h-6 w-6 text-blue-600" />
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900">View My Courses</p>
							<p class="text-sm text-gray-500">Manage course scores and submissions</p>
						</div>
					</a>
				{:else if user.role === 'HOD'}
					<a
						href="/hod/department"
						class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<div class="flex-shrink-0">
							<TrendingUp class="h-6 w-6 text-green-600" />
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900">Department Overview</p>
							<p class="text-sm text-gray-500">Monitor all departmental submissions</p>
						</div>
					</a>
					<a
						href="/hod/reports"
						class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<div class="flex-shrink-0">
							<FileText class="h-6 w-6 text-purple-600" />
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900">Generate Reports</p>
							<p class="text-sm text-gray-500">Export departmental CA reports</p>
						</div>
					</a>
				{:else if user.role === 'ADMIN'}
					<a
						href="/admin/users"
						class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<div class="flex-shrink-0">
							<Users class="h-6 w-6 text-blue-600" />
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900">Manage Users</p>
							<p class="text-sm text-gray-500">Create and manage user accounts</p>
						</div>
					</a>
					<a
						href="/admin/courses"
						class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<div class="flex-shrink-0">
							<BookOpen class="h-6 w-6 text-green-600" />
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900">Manage Courses</p>
							<p class="text-sm text-gray-500">Create courses and assign lecturers</p>
						</div>
					</a>
					<a
						href="/admin/reports"
						class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<div class="flex-shrink-0">
							<FileText class="h-6 w-6 text-purple-600" />
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900">System Reports</p>
							<p class="text-sm text-gray-500">Generate comprehensive reports</p>
						</div>
					</a>
				{/if}
			</div>
		</div>
	</div>
</div>
