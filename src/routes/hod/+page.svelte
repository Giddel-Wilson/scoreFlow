<script lang="ts">
	import type { PageData } from './$types';
	import { BookOpen, Users, CheckCircle, Clock, FileBarChart, TrendingUp, UserCheck } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const department = $derived(data.department);
	const courses = $derived(data.courses);
	const stats = $derived(data.stats);
	const recentSubmissions = $derived(data.recentSubmissions);
	const lecturers = $derived(data.lecturers);

	function formatDate(date: string | Date) {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		return dateObj.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>HOD Dashboard - {department?.name || 'Loading'} - ScoreFlow</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">Head of Department Dashboard</h1>
					<p class="text-gray-600">{department?.name || 'Loading...'}</p>
				</div>
				<div class="flex items-center space-x-4">
					<a 
						href="/hod/reports" 
						class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
					>
						<FileBarChart class="h-4 w-4 mr-2" />
						View Reports
					</a>
				</div>
			</div>
		</div>

		<!-- Statistics Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<BookOpen class="h-8 w-8 text-blue-600" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
								<dd class="text-3xl font-semibold text-gray-900">{stats.totalCourses}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<CheckCircle class="h-8 w-8 text-green-600" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Scores Submitted</dt>
								<dd class="text-3xl font-semibold text-gray-900">{stats.coursesWithSubmissions}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<Clock class="h-8 w-8 text-yellow-600" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Pending Submissions</dt>
								<dd class="text-3xl font-semibold text-gray-900">{stats.pendingCourses}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Recent Submissions -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
					<h3 class="text-lg leading-6 font-medium text-gray-900">Recent Submissions</h3>
					<p class="mt-1 max-w-2xl text-sm text-gray-500">Latest score submissions in your department</p>
				</div>
				<div class="overflow-hidden">
					{#if recentSubmissions.length > 0}
						<ul class="divide-y divide-gray-200">
							{#each recentSubmissions as submission}
								<li class="px-4 py-4 hover:bg-gray-50">
									<div class="flex items-center justify-between">
										<div class="flex items-center">
											<TrendingUp class="h-5 w-5 text-green-500 mr-3" />
											<div>
												<p class="text-sm font-medium text-gray-900">{submission.course.code}</p>
												<p class="text-sm text-gray-500">by {submission.submittedByUser.name}</p>
											</div>
										</div>
										<div class="text-right">
											<p class="text-xs text-gray-500">{formatDate(submission.updatedAt)}</p>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{:else}
						<div class="px-4 py-8 text-center">
							<Clock class="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<p class="text-gray-500">No recent submissions</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Lecturers in Department -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
					<h3 class="text-lg leading-6 font-medium text-gray-900">Department Lecturers</h3>
					<p class="mt-1 max-w-2xl text-sm text-gray-500">Faculty members in your department</p>
				</div>
				<div class="overflow-hidden">
					{#if lecturers.length > 0}
						<ul class="divide-y divide-gray-200">
							{#each lecturers as lecturer}
								<li class="px-4 py-4 hover:bg-gray-50">
									<div class="flex items-center justify-between">
										<div class="flex items-center">
											<UserCheck class="h-5 w-5 text-blue-500 mr-3" />
											<div>
												<p class="text-sm font-medium text-gray-900">{lecturer.name}</p>
												<p class="text-sm text-gray-500">{lecturer.email}</p>
											</div>
										</div>
										<div class="text-right">
											<p class="text-xs text-gray-500">{lecturer.courseAssignments.length} courses</p>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{:else}
						<div class="px-4 py-8 text-center">
							<Users class="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<p class="text-gray-500">No lecturers found</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Courses Overview -->
		<div class="mt-8 bg-white shadow rounded-lg">
			<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
				<h3 class="text-lg leading-6 font-medium text-gray-900">Department Courses</h3>
				<p class="mt-1 max-w-2xl text-sm text-gray-500">All courses in your department</p>
			</div>
			<div class="overflow-x-auto">
				{#if courses.length > 0}
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lecturer</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each courses as course}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<div class="text-sm font-medium text-gray-900">{course.code}</div>
											<div class="text-sm text-gray-500">{course.title}</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										Level {course.level}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{#if course.courseAssignments.length > 0}
											{course.courseAssignments[0].user.name}
										{:else}
											<span class="text-gray-400">Not assigned</span>
										{/if}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										{#if course.caScores.length > 0}
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												<CheckCircle class="h-3 w-3 mr-1" />
												Submitted
											</span>
										{:else}
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
												<Clock class="h-3 w-3 mr-1" />
												Pending
											</span>
										{/if}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{course.caScores.length}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<div class="px-4 py-8 text-center">
						<BookOpen class="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p class="text-gray-500">No courses found</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
