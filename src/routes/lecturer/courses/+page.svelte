<script lang="ts">
	import type { PageData } from './$types';
	import { BookOpen, Users, CheckCircle, Clock, Edit, Eye } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const courses = $derived(data.courses);

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
</script>

<svelte:head>
	<title>My Courses - ScoreFlow</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">My Courses</h1>
		<p class="mt-2 text-gray-600">
			Manage continuous assessment scores for your assigned courses
		</p>
	</div>

	{#if courses.length === 0}
		<div class="text-center py-12">
			<BookOpen class="mx-auto h-12 w-12 text-gray-400" />
			<h3 class="mt-2 text-sm font-medium text-gray-900">No courses assigned</h3>
			<p class="mt-1 text-sm text-gray-500">
				You don't have any courses assigned for this session.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each courses as course}
				<div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
					<div class="p-6">
						<div class="flex items-center justify-between mb-4">
							<div class="flex items-center">
								<BookOpen class="h-8 w-8 text-blue-600" />
								<div class="ml-3">
									<h3 class="text-lg font-medium text-gray-900">
										{course.code}
									</h3>
									<p class="text-sm text-gray-500">
										Level {course.level} • Semester {course.semester}
									</p>
								</div>
							</div>
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadge(course.submissionStatus)}">
								<svelte:component this={getStatusIcon(course.submissionStatus)} class="h-3 w-3 mr-1" />
								{getStatusText(course.submissionStatus)}
							</span>
						</div>

						<h4 class="text-sm font-medium text-gray-900 mb-2">
							{course.title}
						</h4>

						<div class="flex items-center text-sm text-gray-500 mb-4">
							<Users class="h-4 w-4 mr-1" />
							<span>{course.submittedStudents}/{course.totalStudents} students</span>
						</div>

						<div class="flex space-x-2">
                            {#if course.submissionStatus === 'pending' || course.submissionStatus === 'draft'}
								<a
								href="/lecturer/courses/{course.id}/scores"
								class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors"
							>
                                Edit Scores
                        </a>
                        {:else}
								<a
									href="/lecturer/courses/{course.id}/scores"
									class="w-full flex justify-center items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors"
								>
									Preview Scores<Eye class="h-4 w-4" />
								</a>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
