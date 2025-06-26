<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { BookOpen, Users, CheckCircle, Clock, Edit, Download, Filter, Search } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const courses = $derived(data.courses);
	const lecturers = $derived(data.lecturers);
	const department = $derived(data.department);
	const filters = $derived(data.filters);

	function getStatusBadge(status: string) {
		switch (status) {
			case 'submitted':
				return 'bg-green-100 text-green-800';
			case 'draft':
				return 'bg-yellow-100 text-yellow-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'submitted':
				return CheckCircle;
			case 'draft':
				return Edit;
			default:
				return Clock;
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'submitted':
				return 'Submitted';
			case 'draft':
				return 'Draft';
			default:
				return 'Pending';
		}
	}

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
		goto('/hod/department');
	}

	function exportCourse(courseId: number, format: string) {
		window.open(`/hod/courses/${courseId}/export?format=${format}`, '_blank');
	}

	// Get statistics
	const stats = $derived({
		total: courses.length,
		submitted: courses.filter((c: any) => c.status === 'submitted').length,
		draft: courses.filter((c: any) => c.status === 'draft').length,
		pending: courses.filter((c: any) => c.status === 'pending').length
	});
</script>

<svelte:head>
	<title>Department Overview - ScoreFlow</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Department Overview</h1>
		<p class="mt-2 text-gray-600">
			{department?.name} • Monitor all course submissions and generate reports
		</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
		<div class="bg-white overflow-hidden shadow rounded-lg">
			<div class="p-5">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="bg-blue-500 rounded-md p-3">
							<BookOpen class="h-6 w-6 text-white" />
						</div>
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
							<dd class="text-lg font-medium text-gray-900">{stats.total}</dd>
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
							<CheckCircle class="h-6 w-6 text-white" />
						</div>
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">Submitted</dt>
							<dd class="text-lg font-medium text-gray-900">{stats.submitted}</dd>
						</dl>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-white overflow-hidden shadow rounded-lg">
			<div class="p-5">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="bg-yellow-500 rounded-md p-3">
							<Edit class="h-6 w-6 text-white" />
						</div>
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">Draft</dt>
							<dd class="text-lg font-medium text-gray-900">{stats.draft}</dd>
						</dl>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-white overflow-hidden shadow rounded-lg">
			<div class="p-5">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="bg-gray-500 rounded-md p-3">
							<Clock class="h-6 w-6 text-white" />
						</div>
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">Pending</dt>
							<dd class="text-lg font-medium text-gray-900">{stats.pending}</dd>
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
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div>
					<label for="level" class="block text-sm font-medium text-gray-700">Level</label>
					<select
						id="level"
						value={filters.level || ''}
						onchange={(e) => updateFilter('level', e.currentTarget.value)}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					>
						<option value="">All Levels</option>
						<option value="100">100 Level</option>
						<option value="200">200 Level</option>
						<option value="300">300 Level</option>
						<option value="400">400 Level</option>
					</select>
				</div>

				<div>
					<label for="semester" class="block text-sm font-medium text-gray-700">Semester</label>
					<select
						id="semester"
						value={filters.semester || ''}
						onchange={(e) => updateFilter('semester', e.currentTarget.value)}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					>
						<option value="">All Semesters</option>
						<option value="1">First Semester</option>
						<option value="2">Second Semester</option>
					</select>
				</div>

				<div>
					<label for="status" class="block text-sm font-medium text-gray-700">Status</label>
					<select
						id="status"
						value={filters.status || ''}
						onchange={(e) => updateFilter('status', e.currentTarget.value)}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					>
						<option value="">All Status</option>
						<option value="submitted">Submitted</option>
						<option value="draft">Draft</option>
						<option value="pending">Pending</option>
					</select>
				</div>

				<div>
					<label for="lecturer" class="block text-sm font-medium text-gray-700">Lecturer</label>
					<select
						id="lecturer"
						value={filters.lecturer || ''}
						onchange={(e) => updateFilter('lecturer', e.currentTarget.value)}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					>
						<option value="">All Lecturers</option>
						{#each lecturers as lecturer}
							<option value={lecturer.id}>{lecturer.name}</option>
						{/each}
					</select>
				</div>
			</div>

			{#if filters.level || filters.semester || filters.status || filters.lecturer}
				<div class="mt-4">
					<button
						onclick={clearFilters}
						class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Clear Filters
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Courses Table -->
	<div class="bg-white shadow overflow-hidden sm:rounded-md">
		<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
			<h3 class="text-lg leading-6 font-medium text-gray-900">
				Course Submissions
			</h3>
			<p class="mt-1 max-w-2xl text-sm text-gray-500">
				Overview of all courses and their submission status
			</p>
		</div>

		{#if courses.length === 0}
			<div class="text-center py-12">
				<Search class="mx-auto h-12 w-12 text-gray-400" />
				<h3 class="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
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
								Course
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Lecturer
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Level/Semester
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Students
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
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
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">
										{course.lecturer?.name || 'Not Assigned'}
									</div>
									<div class="text-sm text-gray-500">
										{course.lecturer?.email || ''}
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									Level {course.level} • Semester {course.semester}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{course.submittedStudents}/{course.totalStudents}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadge(course.status)}">
										<svelte:component this={getStatusIcon(course.status)} class="h-3 w-3 mr-1" />
										{getStatusText(course.status)}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<div class="flex space-x-2">
										<a
											href="/hod/courses/{course.id}/view"
											class="text-blue-600 hover:text-blue-900"
										>
											View
										</a>
										{#if course.status !== 'pending'}
											<button
												onclick={() => exportCourse(course.id, 'pdf')}
												class="text-green-600 hover:text-green-900"
											>
												<Download class="h-4 w-4" />
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
