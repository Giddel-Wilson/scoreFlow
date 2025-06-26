<script lang="ts">
	import type { PageData } from './$types';
	import { 
		Users, 
		BookOpen, 
		Building2, 
		FileText, 
		TrendingUp, 
		Clock, 
		CheckCircle,
		AlertTriangle,
		Download,
		BarChart3,
		PieChart,
		Activity
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const systemStats = $derived(data.systemStats);
	const departmentStats = $derived(data.departmentStats);
	const recentSubmissions = $derived(data.recentSubmissions);
	const performanceMetrics = $derived(data.performanceMetrics);
	const userStats = $derived(data.userStats);

	function formatDate(dateString: string | Date) {
		const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getRoleLabel(role: string) {
		switch (role) {
			case 'ADMIN': return 'Administrators';
			case 'HOD': return 'Heads of Department';
			case 'LECTURER': return 'Lecturers';
			default: return role;
		}
	}

	function downloadSystemReport() {
		const reportData = {
			generatedAt: new Date().toISOString(),
			systemStats,
			departmentStats,
			performanceMetrics,
			recentSubmissions: recentSubmissions.map(sub => ({
				course: sub.course.code,
				department: sub.course.department.name,
				student: sub.student.name,
				submittedBy: sub.submittedByUser.name,
				submittedAt: sub.updatedAt,
				score: sub.score
			}))
		};
		
		const blob = new Blob([JSON.stringify(reportData, null, 2)], {
			type: 'application/json'
		});
		
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `system-report-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>System Reports - Admin - ScoreFlow</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">System Reports</h1>
					<p class="text-gray-600">Comprehensive system analytics and performance metrics</p>
				</div>
				<button
					onclick={downloadSystemReport}
					class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
				>
					<Download class="h-4 w-4 mr-2" />
					Download Report
				</button>
			</div>
		</div>

		<!-- System Overview Statistics -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="p-2 bg-blue-100 rounded-lg">
						<Users class="h-6 w-6 text-blue-600" />
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-500">Total Users</p>
						<p class="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
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
						<p class="text-2xl font-bold text-gray-900">{systemStats.totalCourses}</p>
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
						<p class="text-2xl font-bold text-gray-900">{systemStats.totalStudents}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="p-2 bg-orange-100 rounded-lg">
						<FileText class="h-6 w-6 text-orange-600" />
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-500">Total Submissions</p>
						<p class="text-2xl font-bold text-gray-900">{systemStats.totalSubmissions}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Performance Metrics -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-500">Submission Rate</p>
						<p class="text-2xl font-bold text-gray-900">{performanceMetrics.submissionRate}%</p>
					</div>
					<div class="p-2 bg-green-100 rounded-lg">
						<TrendingUp class="h-6 w-6 text-green-600" />
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-500">Active Users</p>
						<p class="text-2xl font-bold text-gray-900">{performanceMetrics.activeUsers}</p>
					</div>
					<div class="p-2 bg-blue-100 rounded-lg">
						<Activity class="h-6 w-6 text-blue-600" />
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-500">Avg. Submissions/Course</p>
						<p class="text-2xl font-bold text-gray-900">{systemStats.averageSubmissionsPerCourse}</p>
					</div>
					<div class="p-2 bg-purple-100 rounded-lg">
						<BarChart3 class="h-6 w-6 text-purple-600" />
					</div>
				</div>
			</div>
		</div>

		<!-- User Statistics by Role -->
		<div class="bg-white rounded-lg shadow mb-8">
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-medium text-gray-900">User Distribution by Role</h2>
			</div>
			<div class="p-6">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					{#each userStats as stat}
						<div class="text-center p-4 bg-gray-50 rounded-lg">
							<p class="text-sm font-medium text-gray-500">{getRoleLabel(stat.role)}</p>
							<p class="text-2xl font-bold text-gray-900">{stat._count.id}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Department Statistics -->
		<div class="bg-white rounded-lg shadow mb-8">
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-medium text-gray-900">Department Performance</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Department
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Courses
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Students
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Submissions
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Staff
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Completion Rate
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each departmentStats as dept}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="p-2 bg-gray-100 rounded-lg mr-3">
											<Building2 class="h-4 w-4 text-gray-600" />
										</div>
										<div class="text-sm font-medium text-gray-900">{dept.name}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{dept.totalCourses} total • {dept.coursesWithSubmissions} with submissions
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{dept.totalStudents} enrolled • {dept.totalStudentsInCourses} in courses
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{dept.totalSubmissions} submitted
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{dept.lecturers} lecturers • {dept.hods} HOD
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if dept.totalCourses > 0}
										{@const rate = Math.round((dept.coursesWithSubmissions / dept.totalCourses) * 100)}
										<div class="flex items-center">
											<div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
												<div 
													class="bg-blue-600 h-2 rounded-full" 
													style="width: {rate}%"
												></div>
											</div>
											<span class="text-sm font-medium text-gray-900">{rate}%</span>
										</div>
									{:else}
										<span class="text-sm text-gray-500">No courses</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Recent Submissions -->
		<div class="bg-white rounded-lg shadow">
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-medium text-gray-900">Recent Submissions (Last 30 Days)</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Course
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Student
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Department
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Score
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Submitted By
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Date
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each recentSubmissions as submission}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">{submission.course.code}</div>
									<div class="text-sm text-gray-500">{submission.course.title}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">{submission.student.name}</div>
									<div class="text-sm text-gray-500">{submission.student.regNo}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
										{submission.course.department.name}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if submission.score !== null}
										<span class="text-sm font-medium text-gray-900">{submission.score}/30</span>
									{:else}
										<span class="text-sm text-gray-500">No score</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{submission.submittedByUser.name}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{formatDate(submission.updatedAt)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
