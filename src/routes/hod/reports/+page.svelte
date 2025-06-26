<script lang="ts">
	import type { PageData } from './$types';
	import { ArrowLeft, Download, FileBarChart, Users, BookOpen, TrendingUp, AlertTriangle } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const department = $derived(data.department);
	const courseReports = $derived(data.courseReports);
	const departmentStats = $derived(data.departmentStats);
	const crossDepartmentalStudents = $derived(data.crossDepartmentalStudents);

	function calculateCourseStats(course: any) {
		const allScores = course.caScores;
		const submittedScores = allScores.filter((score: any) => score.isSubmitted);
		const totalStudents = allScores.length;
		const submittedStudents = submittedScores.length;
		
		if (submittedScores.length === 0) {
			return {
				totalStudents,
				submittedStudents,
				averageScore: 0,
				passRate: 0,
				isSubmitted: false
			};
		}

		const scores = submittedScores.map((s: any) => s.score).filter((s: any) => s !== null);
		const averageScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
		const passRate = scores.length > 0 ? (scores.filter((s: number) => s >= 15).length / scores.length) * 100 : 0;

		return {
			totalStudents,
			submittedStudents,
			averageScore: Math.round(averageScore * 100) / 100,
			passRate: Math.round(passRate * 100) / 100,
			isSubmitted: submittedStudents > 0
		};
	}

	function downloadReport() {
		const reportData = courseReports.map(course => {
			const stats = calculateCourseStats(course);
			const lecturer = course.courseAssignments[0]?.user?.name || 'Not assigned';
			
			return {
				'Course Code': course.code,
				'Course Title': course.title,
				'Level': course.level,
				'Semester': course.semester,
				'Lecturer': lecturer,
				'Total Students': stats.totalStudents,
				'Submitted Students': stats.submittedStudents,
				'Average Score': stats.averageScore,
				'Pass Rate (%)': stats.passRate,
				'Status': stats.isSubmitted ? 'Submitted' : 'Pending'
			};
		});

		const csv = [
			Object.keys(reportData[0] || {}).join(','),
			...reportData.map(row => Object.values(row).join(','))
		].join('\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', `${department.name}_department_report.csv`);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Department Reports - {department?.name || 'Loading'} - ScoreFlow</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center mb-4">
				<a 
					href="/hod" 
					class="flex items-center text-gray-500 hover:text-gray-700 mr-4"
				>
					<ArrowLeft class="h-5 w-5 mr-1" />
					Back to Dashboard
				</a>
			</div>
			
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">Department Reports</h1>
					<p class="text-gray-600">{department?.name || 'Loading...'}</p>
				</div>
				<div class="flex items-center space-x-4">
					<button
						onclick={downloadReport}
						class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
					>
						<Download class="h-4 w-4 mr-2" />
						Download Report
					</button>
				</div>
			</div>
		</div>

		<!-- Summary Statistics -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<BookOpen class="h-8 w-8 text-blue-600" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
								<dd class="text-3xl font-semibold text-gray-900">{departmentStats.totalCourses}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<TrendingUp class="h-8 w-8 text-green-600" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Submitted</dt>
								<dd class="text-3xl font-semibold text-gray-900">{departmentStats.submittedCourses}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<AlertTriangle class="h-8 w-8 text-yellow-600" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Pending</dt>
								<dd class="text-3xl font-semibold text-gray-900">{departmentStats.pendingCourses}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<Users class="h-8 w-8 text-purple-600" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Students</dt>
								<dd class="text-3xl font-semibold text-gray-900">{departmentStats.totalStudentsWithScores}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Cross-Departmental Students -->
		{#if crossDepartmentalStudents.length > 0}
			<div class="mb-8 bg-white shadow rounded-lg">
				<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
					<h3 class="text-lg leading-6 font-medium text-gray-900">Cross-Departmental Enrollments</h3>
					<p class="mt-1 max-w-2xl text-sm text-gray-500">Students from other departments taking courses in {department.name}</p>
				</div>
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Home Department</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses Taken</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each crossDepartmentalStudents as student}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<div class="text-sm font-medium text-gray-900">{student.name}</div>
											<div class="text-sm text-gray-500">{student.regNo}</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{student.department.name}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										Level {student.level}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{student.caScores.map(score => score.course.code).join(', ')}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Course Reports -->
		<div class="bg-white shadow rounded-lg">
			<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
				<h3 class="text-lg leading-6 font-medium text-gray-900">Course Performance Reports</h3>
				<p class="mt-1 max-w-2xl text-sm text-gray-500">Detailed performance data for all department courses</p>
			</div>
			<div class="overflow-x-auto">
				{#if courseReports.length > 0}
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lecturer</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each courseReports as course}
								{@const stats = calculateCourseStats(course)}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										<div>
											<div class="text-sm font-medium text-gray-900">{course.code}</div>
											<div class="text-sm text-gray-500">{course.title}</div>
											<div class="text-xs text-gray-400">Level {course.level} • Semester {course.semester}</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{#if course.courseAssignments.length > 0}
											{course.courseAssignments[0].user.name}
										{:else}
											<span class="text-gray-400">Not assigned</span>
										{/if}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<span class="font-medium">{stats.submittedStudents}</span>
										<span class="text-gray-500">/{stats.totalStudents}</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{#if stats.isSubmitted}
											<span class="font-medium">{stats.averageScore}/30</span>
										{:else}
											<span class="text-gray-400">-</span>
										{/if}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{#if stats.isSubmitted}
											<span class="font-medium {stats.passRate >= 70 ? 'text-green-600' : stats.passRate >= 50 ? 'text-yellow-600' : 'text-red-600'}">
												{stats.passRate}%
											</span>
										{:else}
											<span class="text-gray-400">-</span>
										{/if}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										{#if stats.isSubmitted}
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												Submitted
											</span>
										{:else}
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
												Pending
											</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<div class="px-4 py-8 text-center">
						<FileBarChart class="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p class="text-gray-500">No course reports available</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
