<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { BookOpen, Users, Plus, Trash2, Edit, UserPlus, BarChart3, FileText, TrendingUp } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const courses = $derived(data.courses);
	const departments = $derived(data.departments);
	const lecturers = $derived(data.lecturers);
	const stats = $derived(data.stats);

	let showCreateModal = $state(false);
	let showAssignModal = $state(false);
	let selectedCourse = $state<any>(null);
	let loading = $state(false);

	function openCreateModal() {
		showCreateModal = true;
	}

	function closeCreateModal() {
		showCreateModal = false;
	}

	function openAssignModal(course: any) {
		selectedCourse = course;
		showAssignModal = true;
	}

	function closeAssignModal() {
		selectedCourse = null;
		showAssignModal = false;
	}

	function calculateCourseStats(course: any) {
		const totalStudents = course._count.caScores;
		const submittedScores = course.caScores.filter((score: any) => score.isSubmitted).length;
		const lecturer = course.courseAssignments[0]?.user?.name || 'Not assigned';
		
		return {
			totalStudents,
			submittedScores,
			lecturer,
			isSubmitted: submittedScores > 0
		};
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Course Management - Admin - ScoreFlow</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">Course Management</h1>
					<p class="text-gray-600">Manage courses, assignments, and submissions</p>
				</div>
				<button
					onclick={openCreateModal}
					class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
				>
					<Plus class="h-4 w-4 mr-2" />
					Create Course
				</button>
			</div>
		</div>

		<!-- Statistics Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="p-2 bg-blue-100 rounded-lg">
						<BookOpen class="h-6 w-6 text-blue-600" />
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-500">Total Courses</p>
						<p class="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="p-2 bg-green-100 rounded-lg">
						<TrendingUp class="h-6 w-6 text-green-600" />
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-500">With Submissions</p>
						<p class="text-2xl font-bold text-gray-900">{stats.coursesWithSubmissions}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="p-2 bg-yellow-100 rounded-lg">
						<BarChart3 class="h-6 w-6 text-yellow-600" />
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-500">Pending</p>
						<p class="text-2xl font-bold text-gray-900">{stats.pendingCourses}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="p-2 bg-purple-100 rounded-lg">
						<FileText class="h-6 w-6 text-purple-600" />
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-500">Total Submissions</p>
						<p class="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Courses Table -->
		<div class="bg-white shadow rounded-lg">
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-medium text-gray-900">All Courses</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Course
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Department
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Level/Semester
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Lecturer
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Students/Submissions
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each courses as course}
							{@const stats = calculateCourseStats(course)}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">{course.code}</div>
										<div class="text-sm text-gray-500">{course.title}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
										{course.department.name}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									Level {course.level} • Semester {course.semester}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">{stats.lecturer}</div>
									{#if stats.lecturer === 'Not assigned'}
										<button
											onclick={() => openAssignModal(course)}
											class="text-xs text-blue-600 hover:text-blue-800"
										>
											Assign Lecturer
										</button>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{stats.totalStudents} students • {stats.submittedScores} submitted
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if stats.isSubmitted}
										<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
											Submitted
										</span>
									{:else}
										<span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
											Pending
										</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div class="flex space-x-2">
										<button
											onclick={() => openAssignModal(course)}
											class="text-blue-600 hover:text-blue-900"
											title="Assign Lecturer"
										>
											<UserPlus class="h-4 w-4" />
										</button>
										<form method="post" action="?/deleteCourse" use:enhance>
											<input type="hidden" name="courseId" value={course.id} />
											<button
												type="submit"
												class="text-red-600 hover:text-red-900"
												title="Delete Course"
												onclick={(e) => {
													if (!confirm('Are you sure you want to delete this course?')) {
														e.preventDefault();
													}
												}}
											>
												<Trash2 class="h-4 w-4" />
											</button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<!-- Create Course Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
			<div class="mt-3">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Create New Course</h3>
				<form method="post" action="?/createCourse" use:enhance>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
							<input
								type="text"
								name="code"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="e.g., CSC301"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
							<input
								type="text"
								name="title"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="e.g., Database Systems"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Level</label>
							<select
								name="level"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select Level</option>
								<option value="100">100</option>
								<option value="200">200</option>
								<option value="300">300</option>
								<option value="400">400</option>
								<option value="500">500</option>
								<option value="600">600</option>
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
							<select
								name="semester"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select Semester</option>
								<option value="1">1st Semester</option>
								<option value="2">2nd Semester</option>
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Session</label>
							<input
								type="text"
								name="session"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="e.g., 2023/2024"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
							<select
								name="departmentId"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select Department</option>
								{#each departments as dept}
									<option value={dept.id}>{dept.name}</option>
								{/each}
							</select>
						</div>
						<div class="md:col-span-2">
							<label class="block text-sm font-medium text-gray-700 mb-1">Lecturer (Optional)</label>
							<select
								name="lecturerId"
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select Lecturer (Optional)</option>
								{#each lecturers as lecturer}
									<option value={lecturer.id}>{lecturer.name} ({lecturer.department?.name})</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="flex justify-end space-x-3 mt-6">
						<button
							type="button"
							onclick={closeCreateModal}
							class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
						>
							Create Course
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Assign Lecturer Modal -->
{#if showAssignModal && selectedCourse}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
			<div class="mt-3">
				<h3 class="text-lg font-medium text-gray-900 mb-4">
					Assign Lecturer to {selectedCourse.code}
				</h3>
				<form method="post" action="?/assignLecturer" use:enhance>
					<input type="hidden" name="courseId" value={selectedCourse.id} />
					<div class="mb-4">
						<label class="block text-sm font-medium text-gray-700 mb-1">Select Lecturer</label>
						<select
							name="lecturerId"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select Lecturer</option>
							{#each lecturers as lecturer}
								<option value={lecturer.id}>{lecturer.name} ({lecturer.department?.name})</option>
							{/each}
						</select>
					</div>
					<div class="flex justify-end space-x-3">
						<button
							type="button"
							onclick={closeAssignModal}
							class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
						>
							Assign Lecturer
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

{#if form?.error}
	<div class="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 z-50">
		<div class="text-sm text-red-800">{form.error}</div>
	</div>
{/if}

{#if form?.success}
	<div class="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-md p-4 z-50">
		<div class="text-sm text-green-800">Operation completed successfully!</div>
	</div>
{/if}
