<script lang="ts">
	import type { PageData } from './$types';
	import { BookOpen, Users, TrendingUp, ArrowLeft, Download, BarChart3 } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const course = $derived(data.course);
	const lecturer = $derived(data.lecturer);
	const scoreStats = $derived(data.scoreStats);

	function getGradeColor(grade: string) {
		switch (grade) {
			case 'A': return 'bg-green-500';
			case 'B': return 'bg-blue-500';
			case 'C': return 'bg-yellow-500';
			case 'D': return 'bg-orange-500';
			case 'F': return 'bg-red-500';
			default: return 'bg-gray-500';
		}
	}

	function exportReport(format: string) {
		window.open(`/hod/courses/${course.id}/export?format=${format}`, '_blank');
	}
</script>

<svelte:head>
	<title>{course.code} - Course View - ScoreFlow</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center mb-4">
			<a 
				href="/hod/department" 
				class="flex items-center text-gray-500 hover:text-gray-700 mr-4"
			>
				<ArrowLeft class="h-5 w-5 mr-1" />
				Back to Department
			</a>
		</div>
		
		<div class="flex items-center justify-between">
			<div class="flex items-center">
				<BookOpen class="h-8 w-8 text-blue-600 mr-3" />
				<div>
					<h1 class="text-3xl font-bold text-gray-900">{course.code}</h1>
					<p class="text-gray-600">{course.title}</p>
					<p class="text-sm text-gray-500">
						{course.department.name} • Level {course.level} • Semester {course.semester} • {course.session}
					</p>
				</div>
			</div>
			
			{#if data.hasSubmittedScores}
				<div class="flex space-x-3">
					<button
						onclick={() => exportReport('pdf')}
						class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<Download class="h-4 w-4 mr-2" />
						Export PDF
					</button>
					<button
						onclick={() => exportReport('csv')}
						class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<Download class="h-4 w-4 mr-2" />
						Export CSV
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Course Info -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
		<div class="bg-white overflow-hidden shadow rounded-lg">
			<div class="p-5">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<Users class="h-8 w-8 text-blue-600" />
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">Lecturer</dt>
							<dd class="text-lg font-medium text-gray-900">
								{lecturer?.name || 'Not Assigned'}
							</dd>
							{#if lecturer?.email}
								<dd class="text-sm text-gray-500">{lecturer.email}</dd>
							{/if}
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
							<dt class="text-sm font-medium text-gray-500 truncate">Students</dt>
							<dd class="text-lg font-medium text-gray-900">
								{data.studentsWithScores}/{data.totalStudents}
							</dd>
							<dd class="text-sm text-gray-500">with scores entered</dd>
						</dl>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-white overflow-hidden shadow rounded-lg">
			<div class="p-5">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<BarChart3 class="h-8 w-8 text-purple-600" />
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">Status</dt>
							<dd class="text-lg font-medium text-gray-900">
								{data.hasSubmittedScores ? 'Submitted' : 'Pending'}
							</dd>
							<dd class="text-sm text-gray-500">
								{data.hasSubmittedScores ? 'Scores finalized' : 'Awaiting submission'}
							</dd>
						</dl>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Score Statistics -->
	{#if scoreStats}
		<div class="bg-white shadow rounded-lg mb-8">
			<div class="px-4 py-5 sm:p-6">
				<h3 class="text-lg leading-6 font-medium text-gray-900 mb-6">Score Analysis</h3>
				
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<div class="text-center">
						<div class="text-2xl font-bold text-blue-600">{scoreStats.average}</div>
						<div class="text-sm text-gray-500">Average Score</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-green-600">{scoreStats.highest}</div>
						<div class="text-sm text-gray-500">Highest Score</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-red-600">{scoreStats.lowest}</div>
						<div class="text-sm text-gray-500">Lowest Score</div>
					</div>
				</div>

				<div>
					<h4 class="text-md font-medium text-gray-900 mb-4">Grade Distribution</h4>
					<div class="space-y-3">
						{#each Object.entries(scoreStats.gradeDistribution) as [grade, count]}
							<div class="flex items-center">
								<div class="w-8 text-sm font-medium text-gray-700">{grade}:</div>
								<div class="flex-1 bg-gray-200 rounded-full h-6 mx-3">
									<div 
										class="{getGradeColor(grade)} h-6 rounded-full transition-all duration-300"
										style="width: {data.totalStudents > 0 ? (count / data.totalStudents) * 100 : 0}%"
									></div>
								</div>
								<div class="w-12 text-sm text-gray-600 text-right">{count}</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Student Scores Table -->
	<div class="bg-white shadow overflow-hidden sm:rounded-md">
		<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
			<h3 class="text-lg leading-6 font-medium text-gray-900">
				Student Scores
			</h3>
			<p class="mt-1 max-w-2xl text-sm text-gray-500">
				Detailed list of all students and their CA scores
			</p>
		</div>

		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							#
						</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Registration Number
						</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Student Name
						</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Score
						</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Grade
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each course.caScores as scoreRecord, index}
						<tr class:bg-gray-50={index % 2 === 1}>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{index + 1}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
								{scoreRecord.student.regNo}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								{scoreRecord.student.name}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								{#if scoreRecord.score !== null}
									<span class="font-semibold">{scoreRecord.score}</span>/30
								{:else}
									<span class="text-gray-400">Not entered</span>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if scoreRecord.score !== null}
									{#if scoreRecord.score >= 25}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">A</span>
									{:else if scoreRecord.score >= 20}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">B</span>
									{:else if scoreRecord.score >= 15}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">C</span>
									{:else if scoreRecord.score >= 10}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">D</span>
									{:else}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">F</span>
									{/if}
								{:else}
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">-</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if course.caScores.length === 0}
			<div class="text-center py-12">
				<Users class="mx-auto h-12 w-12 text-gray-400" />
				<h3 class="mt-2 text-sm font-medium text-gray-900">No students found</h3>
				<p class="mt-1 text-sm text-gray-500">
					No students are registered for this course level and department.
				</p>
			</div>
		{/if}
	</div>
</div>
