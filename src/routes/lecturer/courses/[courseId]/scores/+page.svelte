<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { BookOpen, Save, Send, AlertCircle, CheckCircle, ArrowLeft, UserPlus, Upload, Download, Edit, Trash2 } from 'lucide-svelte';
	import ModalNotification from '$lib/components/ModalNotification.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const course = $derived(data.course);
	const departments = $derived(data.departments);
	const students = $derived(data.students);
	const hasSubmittedScores = $derived(data.hasSubmittedScores);

	let scores: Record<number, string> = $state({});
	let saving = $state(false);
	let submitting = $state(false);
	let showAddModal = $state(false);
	let showBulkModal = $state(false);
	let showEditModal = $state(false);
	let adding = $state(false);
	let uploading = $state(false);
	let editing = $state(false);
	let deleting = $state(false);
	let editingStudent: any = $state(null);
	
	// Modal notification states
	let showNotification = $state(false);
	let notificationType: 'success' | 'error' | 'warning' | 'info' = $state('info');
	let notificationTitle = $state('');
	let notificationMessage = $state('');
	let showNotificationCancel = $state(false);
	let notificationConfirmText = $state('OK');
	let notificationCancelText = $state('Cancel');
	let notificationOnConfirm: (() => void) | null = $state(null);
	let notificationOnCancel: (() => void) | null = $state(null);
	
	// Confirmation states
	let showSubmitConfirm = $state(false);
	let showDeleteConfirm = $state(false);
	let studentToDelete: any = $state(null);

	// Initialize scores from existing data
	$effect(() => {
		if (students) {
			students.forEach((student: any) => {
				if (student.score && student.score.score !== null) {
					scores[student.id] = student.score.score.toString();
				} else {
					scores[student.id] = '';
				}
			});
		}
	});

	function handleScoreChange(studentId: number, value: string) {
		scores[studentId] = value;
	}

	function validateScore(score: string): boolean {
		const num = parseFloat(score);
		return !isNaN(num) && num >= 0 && num <= 30;
	}

	function getScoresArray() {
		return Object.entries(scores)
			.filter(([_, score]) => score.trim() !== '')
			.map(([studentId, score]) => ({
				studentId: parseInt(studentId),
				score: score
			}));
	}

	function canSubmit() {
		const scoresArray = getScoresArray();
		if (scoresArray.length === 0) return false;
		return scoresArray.every(({ score }) => validateScore(score));
	}

	function downloadTemplate() {
		const headers = ['name,regno,level,department,score,status'];
		const sampleData = [
			'John Doe,CS/2023/001,300,Computer Science,25,ACTIVE',
			'Jane Smith,IT/2023/002,200,Information Technology,22.5,ACTIVE',
			'Bob Wilson,CYB/2023/003,400,Cyber Security,,ACTIVE'
		];
		
		const csvContent = headers.concat(sampleData).join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'student_upload_template.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}

	// Notification helpers
	function showNotificationModal(
		type: 'success' | 'error' | 'warning' | 'info',
		title: string,
		message: string,
		onConfirm?: () => void
	) {
		notificationType = type;
		notificationTitle = title;
		notificationMessage = message;
		showNotificationCancel = false;
		notificationConfirmText = 'OK';
		notificationOnConfirm = onConfirm || null;
		showNotification = true;
	}

	function showConfirmModal(
		title: string,
		message: string,
		onConfirm: () => void,
		onCancel?: () => void,
		confirmText = 'Confirm',
		cancelText = 'Cancel'
	) {
		notificationType = 'warning';
		notificationTitle = title;
		notificationMessage = message;
		showNotificationCancel = true;
		notificationConfirmText = confirmText;
		notificationCancelText = cancelText;
		notificationOnConfirm = onConfirm;
		notificationOnCancel = onCancel || null;
		showNotification = true;
	}

	function editStudent(student: any) {
		editingStudent = { ...student };
		showEditModal = true;
	}

	function confirmDeleteStudent(student: any) {
		showConfirmModal(
			'Delete Student',
			`Are you sure you want to delete ${student.name} (${student.regNo})? This action cannot be undone.`,
			() => deleteStudent(student),
			undefined,
			'Delete',
			'Cancel'
		);
	}

	function deleteStudent(student: any) {
		deleting = true;
		
		// Use fetch to handle the delete action properly
		const formData = new FormData();
		formData.append('studentId', student.id.toString());
		
		const currentUrl = new URL(window.location.href);
		const actionUrl = `${currentUrl.pathname}?/deleteStudent`;
		console.log('Calling delete student action URL:', actionUrl);
		
		fetch(actionUrl, {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			console.log('Delete student response:', data);
			
			// Handle SvelteKit action response format
			if (data.type === 'success') {
				if (data.data && data.data.success === true) {
					const message = data.data.message || 'Student deleted successfully';
					showNotificationModal('success', 'Success', message, () => {
						window.location.reload();
					});
				} else if (data.data && data.data.success === false) {
					const errorMsg = data.data.error || 'Failed to delete student';
					showNotificationModal('error', 'Delete Failed', errorMsg);
				} else {
					showNotificationModal('success', 'Success', 'Student deleted successfully', () => {
						window.location.reload();
					});
				}
			} else if (data.type === 'failure') {
				const errorMsg = data.data?.error || 'Failed to delete student';
				showNotificationModal('error', 'Delete Failed', errorMsg);
			} else if (data.success === true) {
				const message = data.message || 'Student deleted successfully';
				showNotificationModal('success', 'Success', message, () => {
					window.location.reload();
				});
			} else if (data.success === false) {
				const errorMsg = data.error || 'Failed to delete student';
				showNotificationModal('error', 'Delete Failed', errorMsg);
			} else {
				console.log('Unhandled response format, assuming success');
				showNotificationModal('success', 'Success', 'Student deleted successfully', () => {
					window.location.reload();
				});
			}
		})
		.catch(error => {
			console.error('Delete error:', error);
			showNotificationModal('error', 'Delete Failed', 'Network error occurred while deleting student');
		})
		.finally(() => {
			deleting = false;
		});
	}

	function saveScores() {
		saving = true;
		
		const formData = new FormData();
		formData.append('scores', JSON.stringify(getScoresArray()));
		
		const currentUrl = new URL(window.location.href);
		const actionUrl = `${currentUrl.pathname}?/saveScores`;
		console.log('Calling save scores action URL:', actionUrl);
		
		fetch(actionUrl, {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			console.log('Save scores response:', data);
			
			// Handle SvelteKit action response format
			if (data.type === 'success') {
				if (data.data && data.data.success === true) {
					const message = data.data.message || 'Scores saved successfully';
					showNotificationModal('success', 'Success', message);
				} else if (data.data && data.data.success === false) {
					const errorMsg = data.data.error || 'Failed to save scores';
					showNotificationModal('error', 'Save Failed', errorMsg);
				} else {
					showNotificationModal('success', 'Success', 'Scores saved successfully');
				}
			} else if (data.type === 'failure') {
				const errorMsg = data.data?.error || 'Failed to save scores';
				showNotificationModal('error', 'Save Failed', errorMsg);
			} else if (data.success === true) {
				const message = data.message || 'Scores saved successfully';
				showNotificationModal('success', 'Success', message);
			} else if (data.success === false) {
				const errorMsg = data.error || 'Failed to save scores';
				showNotificationModal('error', 'Save Failed', errorMsg);
			} else {
				console.log('Unhandled response format, assuming success');
				showNotificationModal('success', 'Success', 'Scores saved successfully');
			}
		})
		.catch(error => {
			console.error('Save error:', error);
			showNotificationModal('error', 'Save Failed', 'Network error occurred while saving scores');
		})
		.finally(() => {
			saving = false;
		});
	}

	function submitScores() {
		submitting = true;
		
		const formData = new FormData();
		
		const currentUrl = new URL(window.location.href);
		const actionUrl = `${currentUrl.pathname}?/submitScores`;
		console.log('Calling submit scores action URL:', actionUrl);
		
		fetch(actionUrl, {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			console.log('Submit scores response:', data);
			
			// Handle SvelteKit action response format
			if (data.type === 'success') {
				if (data.data && data.data.success === true) {
					const message = data.data.message || 'Scores submitted successfully';
					showNotificationModal('success', 'Success', message, () => {
						window.location.reload();
					});
				} else if (data.data && data.data.success === false) {
					const errorMsg = data.data.error || 'Failed to submit scores';
					showNotificationModal('error', 'Submit Failed', errorMsg);
				} else {
					showNotificationModal('success', 'Success', 'Scores submitted successfully', () => {
						window.location.reload();
					});
				}
			} else if (data.type === 'failure') {
				const errorMsg = data.data?.error || 'Failed to submit scores';
				showNotificationModal('error', 'Submit Failed', errorMsg);
			} else if (data.success === true) {
				const message = data.message || 'Scores submitted successfully';
				showNotificationModal('success', 'Success', message, () => {
					window.location.reload();
				});
			} else if (data.success === false) {
				const errorMsg = data.error || 'Failed to submit scores';
				showNotificationModal('error', 'Submit Failed', errorMsg);
			} else {
				console.log('Unhandled response format, assuming success');
				showNotificationModal('success', 'Success', 'Scores submitted successfully', () => {
					window.location.reload();
				});
			}
		})
		.catch(error => {
			console.error('Submit error:', error);
			showNotificationModal('error', 'Submit Failed', 'Network error occurred while submitting scores');
		})
		.finally(() => {
			submitting = false;
		});
	}

	function bulkUpload() {
		const fileInput = document.getElementById('bulkFile') as HTMLInputElement;
		const file = fileInput?.files?.[0];
		
		if (!file) {
			showNotificationModal('error', 'Upload Failed', 'Please select a file to upload');
			return;
		}
		
		uploading = true;
		
		const formData = new FormData();
		formData.append('file', file);
		
		const currentUrl = new URL(window.location.href);
		const actionUrl = `${currentUrl.pathname}?/bulkUpload`;
		console.log('Calling bulk upload action URL:', actionUrl);
		
		fetch(actionUrl, {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			console.log('Bulk upload response:', data);
			
			// Handle SvelteKit action response format
			if (data.type === 'success') {
				if (data.data && data.data.success === true) {
					let message = data.data.message || 'Students uploaded successfully';
					const details = data.data.details;
					if (details && details.length > 0) {
						message += '\n\nWarnings:\n' + details.join('\n');
					}
					showNotificationModal('success', 'Upload Success', message, () => {
						showBulkModal = false;
						window.location.reload();
					});
				} else if (data.data && data.data.success === false) {
					let errorMsg = data.data.error || 'Failed to upload students';
					const details = data.data.details;
					if (details && details.length > 0) {
						errorMsg += '\n\nDetails:\n' + details.join('\n');
					}
					showNotificationModal('error', 'Upload Failed', errorMsg);
				} else {
					showNotificationModal('success', 'Upload Success', 'Students uploaded successfully', () => {
						showBulkModal = false;
						window.location.reload();
					});
				}
			} else if (data.type === 'failure') {
				let errorMsg = data.data?.error || 'Failed to upload students';
				const details = data.data?.details;
				if (details && details.length > 0) {
					errorMsg += '\n\nDetails:\n' + details.join('\n');
				}
				showNotificationModal('error', 'Upload Failed', errorMsg);
			} else if (data.success === true) {
				let message = data.message || 'Students uploaded successfully';
				const details = data.details;
				if (details && details.length > 0) {
					message += '\n\nWarnings:\n' + details.join('\n');
				}
				showNotificationModal('success', 'Upload Success', message, () => {
					showBulkModal = false;
					window.location.reload();
				});
			} else if (data.success === false) {
				let errorMsg = data.error || 'Failed to upload students';
				const details = data.details;
				if (details && details.length > 0) {
					errorMsg += '\n\nDetails:\n' + details.join('\n');
				}
				showNotificationModal('error', 'Upload Failed', errorMsg);
			} else {
				console.log('Unhandled response format, assuming success');
				showNotificationModal('success', 'Upload Success', 'Students uploaded successfully', () => {
					showBulkModal = false;
					window.location.reload();
				});
			}
		})
		.catch(error => {
			console.error('Upload error:', error);
			showNotificationModal('error', 'Upload Failed', 'Network error occurred while uploading file');
		})
		.finally(() => {
			uploading = false;
		});
	}

	function updateStudent() {
		if (!editingStudent) return;
		
		const name = (document.getElementById('editName') as HTMLInputElement)?.value;
		const regNo = (document.getElementById('editRegNo') as HTMLInputElement)?.value;
		const level = (document.getElementById('editLevel') as HTMLSelectElement)?.value;
		const departmentId = (document.getElementById('editDepartment') as HTMLSelectElement)?.value;
		const score = (document.getElementById('editScore') as HTMLInputElement)?.value;
		const status = (document.getElementById('editStatus') as HTMLSelectElement)?.value;
		
		if (!name || !regNo || !level || !departmentId) {
			showNotificationModal('error', 'Validation Error', 'Please fill in all required fields');
			return;
		}
		
		editing = true;
		
		const formData = new FormData();
		formData.append('studentId', editingStudent.id.toString());
		formData.append('name', name);
		formData.append('regNo', regNo);
		formData.append('level', level);
		formData.append('departmentId', departmentId);
		formData.append('score', score);
		formData.append('status', status);
		
		// Try using the full URL path for the action
		const currentUrl = new URL(window.location.href);
		const actionUrl = `${currentUrl.pathname}?/editStudent`;
		console.log('Calling action URL:', actionUrl);
		
		fetch(actionUrl, {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			console.log('Edit student response:', data);
			console.log('Response type:', typeof data);
			console.log('Response keys:', Object.keys(data));
			console.log('data.type:', data.type);
			console.log('data.success:', data.success);
			console.log('data.data:', data.data);
			
			// Handle SvelteKit action response format
			// When using fetch with actions, SvelteKit wraps the response
			if (data.type === 'success') {
				// Check if the action itself succeeded
				if (data.data && data.data.success === true) {
					showNotificationModal('success', 'Success', data.data.message || 'Student updated successfully', () => {
						showEditModal = false;
						editingStudent = null;
						window.location.reload();
					});
				} else if (data.data && data.data.success === false) {
					const errorMsg = data.data.error || 'Failed to update student';
					showNotificationModal('error', 'Update Failed', errorMsg);
				} else {
					// No data.data but type is success - this might be the direct response
					showNotificationModal('success', 'Success', 'Student updated successfully', () => {
						showEditModal = false;
						editingStudent = null;
						window.location.reload();
					});
				}
			} else if (data.type === 'failure') {
				const errorMsg = data.data?.error || 'Failed to update student';
				showNotificationModal('error', 'Update Failed', errorMsg);
			} else if (data.success === true) {
				// Direct response from action (not wrapped)
				showNotificationModal('success', 'Success', data.message || 'Student updated successfully', () => {
					showEditModal = false;
					editingStudent = null;
					window.location.reload();
				});
			} else if (data.success === false) {
				// Direct error response from action
				const errorMsg = data.error || 'Failed to update student';
				showNotificationModal('error', 'Update Failed', errorMsg);
			} else {
				// Fallback - assume success if no error indicators
				console.log('Unhandled response format, assuming success');
				showNotificationModal('success', 'Success', 'Student updated successfully', () => {
					showEditModal = false;
					editingStudent = null;
					window.location.reload();
				});
			}
		})
		.catch(error => {
			console.error('Update error:', error);
			showNotificationModal('error', 'Update Failed', 'Network error occurred while updating student');
		})
		.finally(() => {
			editing = false;
		});
	}

	function addNewStudent() {
		const name = (document.getElementById('addName') as HTMLInputElement)?.value;
		const regNo = (document.getElementById('addRegNo') as HTMLInputElement)?.value;
		const level = (document.getElementById('addLevel') as HTMLSelectElement)?.value;
		const departmentId = (document.getElementById('addDepartment') as HTMLSelectElement)?.value;
		const score = (document.getElementById('addScore') as HTMLInputElement)?.value;
		const status = (document.getElementById('addStatus') as HTMLSelectElement)?.value;
		
		if (!name || !regNo || !level || !departmentId) {
			showNotificationModal('error', 'Validation Error', 'Please fill in all required fields');
			return;
		}
		
		adding = true;
		
		const formData = new FormData();
		formData.append('name', name);
		formData.append('regNo', regNo);
		formData.append('level', level);
		formData.append('departmentId', departmentId);
		formData.append('score', score);
		formData.append('status', status);
		
		// Try using the full URL path for the action
		const currentUrl = new URL(window.location.href);
		const actionUrl = `${currentUrl.pathname}?/addStudent`;
		console.log('Calling add student action URL:', actionUrl);
		
		fetch(actionUrl, {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			console.log('Add student response:', data);
			console.log('Response type:', typeof data);
			console.log('Response keys:', Object.keys(data));
			console.log('data.type:', data.type);
			console.log('data.success:', data.success);
			console.log('data.data:', data.data);
			
			// Handle SvelteKit action response format
			// When using fetch with actions, SvelteKit wraps the response
			if (data.type === 'success') {
				// Check if the action itself succeeded
				if (data.data && data.data.success === true) {
					showNotificationModal('success', 'Success', data.data.message || 'Student added successfully', () => {
						showAddModal = false;
						// Clear form
						(document.getElementById('addName') as HTMLInputElement).value = '';
						(document.getElementById('addRegNo') as HTMLInputElement).value = '';
						(document.getElementById('addLevel') as HTMLSelectElement).value = '';
						(document.getElementById('addDepartment') as HTMLSelectElement).value = '';
						(document.getElementById('addScore') as HTMLInputElement).value = '';
						(document.getElementById('addStatus') as HTMLSelectElement).value = 'ACTIVE';
						window.location.reload();
					});
				} else if (data.data && data.data.success === false) {
					const errorMsg = data.data.error || 'Failed to add student';
					showNotificationModal('error', 'Add Student Failed', errorMsg);
				} else {
					// No data.data but type is success - this might be the direct response
					showNotificationModal('success', 'Success', 'Student added successfully', () => {
						showAddModal = false;
						// Clear form
						(document.getElementById('addName') as HTMLInputElement).value = '';
						(document.getElementById('addRegNo') as HTMLInputElement).value = '';
						(document.getElementById('addLevel') as HTMLSelectElement).value = '';
						(document.getElementById('addDepartment') as HTMLSelectElement).value = '';
						(document.getElementById('addScore') as HTMLInputElement).value = '';
						(document.getElementById('addStatus') as HTMLSelectElement).value = 'ACTIVE';
						window.location.reload();
					});
				}
			} else if (data.type === 'failure') {
				const errorMsg = data.data?.error || 'Failed to add student';
				showNotificationModal('error', 'Add Student Failed', errorMsg);
			} else if (data.success === true) {
				// Direct response from action (not wrapped)
				showNotificationModal('success', 'Success', data.message || 'Student added successfully', () => {
					showAddModal = false;
					// Clear form
					(document.getElementById('addName') as HTMLInputElement).value = '';
					(document.getElementById('addRegNo') as HTMLInputElement).value = '';
					(document.getElementById('addScore') as HTMLInputElement).value = '';
					(document.getElementById('addStatus') as HTMLSelectElement).value = 'ACTIVE';
					window.location.reload();
				});
			} else if (data.success === false) {
				// Direct error response from action
				const errorMsg = data.error || 'Failed to add student';
				showNotificationModal('error', 'Add Student Failed', errorMsg);
			} else {
				// Fallback - assume success if no error indicators
				console.log('Unhandled response format, assuming success');
				showNotificationModal('success', 'Success', 'Student added successfully', () => {
					showAddModal = false;
					// Clear form
					(document.getElementById('addName') as HTMLInputElement).value = '';
					(document.getElementById('addRegNo') as HTMLInputElement).value = '';
					(document.getElementById('addScore') as HTMLInputElement).value = '';
					(document.getElementById('addStatus') as HTMLSelectElement).value = 'ACTIVE';
					window.location.reload();
				});
			}
		})
		.catch(error => {
			console.error('Add student error:', error);
			showNotificationModal('error', 'Add Student Failed', 'Network error occurred while adding student');
		})
		.finally(() => {
			adding = false;
		});
	}

	function confirmSubmitScores() {
		showConfirmModal(
			'Submit Scores',
			'Are you sure you want to submit these scores? You will not be able to edit them after submission.',
			() => {
				submitScores();
			},
			undefined,
			'Submit',
			'Cancel'
		);
	}
</script>

<svelte:head>
	<title>Enter Scores - {course?.code || 'Loading'} - ScoreFlow</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center mb-4">
				<a 
					href="/lecturer/courses" 
					class="flex items-center text-gray-500 hover:text-gray-700 mr-4"
				>
					<ArrowLeft class="h-5 w-5 mr-1" />
					Back to Courses
				</a>
			</div>
			
			{#if course}
				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<BookOpen class="h-8 w-8 text-blue-600 mr-3" />
						<div>
							<h1 class="text-3xl font-bold text-gray-900">{course.code}</h1>
							<p class="text-gray-600">{course.title}</p>
							<p class="text-sm text-gray-500">
								{course.department.name} • Level {course.level} • Semester {course.semester}
							</p>
						</div>
					</div>
					
					{#if !hasSubmittedScores}
						<div class="flex space-x-3">
							<button
								onclick={() => showAddModal = true}
								class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
							>
								<UserPlus class="h-4 w-4 mr-2" />
								Add Student
							</button>
							<button
								onclick={() => showBulkModal = true}
								class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
							>
								<Upload class="h-4 w-4 mr-2" />
								Bulk Upload
							</button>
						</div>
					{/if}
				</div>

				{#if hasSubmittedScores}
					<div class="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
						<div class="flex">
							<CheckCircle class="h-5 w-5 text-green-400" />
							<div class="ml-3">
								<h3 class="text-sm font-medium text-green-800">
									Scores Submitted
								</h3>
								<p class="mt-1 text-sm text-green-700">
									The scores for this course have been submitted and can no longer be edited.
								</p>
							</div>
						</div>
					</div>
				{/if}
			{:else}
				<div class="animate-pulse">
					<div class="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
					<div class="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
					<div class="h-4 bg-gray-300 rounded w-1/3"></div>
				</div>
			{/if}
		</div>

		<!-- Messages -->
		<!-- Students and Scores -->
		{#if students && students.length > 0}
			<div class="bg-white shadow overflow-hidden sm:rounded-md">
				<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
					<h3 class="text-lg leading-6 font-medium text-gray-900">
						Continuous Assessment Scores
					</h3>
					<p class="mt-1 max-w-2xl text-sm text-gray-500">
						Enter scores for each student (0-30 marks)
					</p>
				</div>

				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Registration Number
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Student Name
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Level
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Score (0-30)
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
							{#each students as student}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{student.regNo}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{student.name}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{student.level}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<input
											type="number"
											min="0"
											max="30"
											step="0.5"
											placeholder="0.0"
											disabled={hasSubmittedScores}
											value={scores[student.id] || ''}
											oninput={(e) => handleScoreChange(student.id, e.currentTarget.value)}
											class="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
											class:border-red-300={scores[student.id] && !validateScore(scores[student.id])}
										/>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										{#if scores[student.id] && validateScore(scores[student.id])}
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												Valid
											</span>
										{:else if scores[student.id] && !validateScore(scores[student.id])}
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
												Invalid
											</span>
										{:else}
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
												Pending
											</span>
										{/if}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
										{#if !hasSubmittedScores}
											<div class="flex space-x-2">
												<button
													onclick={() => editStudent(student)}
													class="text-blue-600 hover:text-blue-900 flex items-center"
													title="Edit student"
												>
													<Edit class="h-4 w-4" />
												</button>											<button
												onclick={() => confirmDeleteStudent(student)}
												class="text-red-600 hover:text-red-900 flex items-center"
												title="Delete student"
											>
													<Trash2 class="h-4 w-4" />
												</button>
											</div>
										{:else}
											<span class="text-gray-400">-</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				{#if !hasSubmittedScores}
					<div class="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
						<div class="flex justify-between items-center">
							<div class="text-sm text-gray-500">
								{getScoresArray().length} of {students.length} students have scores entered
							</div>
							<div class="flex space-x-3">
								<button
									type="button"
									onclick={() => saveScores()}
									disabled={saving || getScoresArray().length === 0}
									class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{#if saving}
										<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
										Saving...
									{:else}
										<Save class="h-4 w-4 mr-2" />
										Save Draft
									{/if}
								</button>

								<button
									type="button"
									disabled={submitting || !canSubmit()}
									onclick={() => confirmSubmitScores()}
									class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{#if submitting}
										<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									{:else}
											<Send class="h-4 w-4 mr-2" />									{/if}
									Submit Scores
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{:else if students}
			<div class="bg-white shadow rounded-md p-8 text-center">
				<p class="text-gray-500 mb-4">No students found for this course.</p>
				{#if !hasSubmittedScores}
					<div class="flex justify-center space-x-3">
						<button
							onclick={() => showAddModal = true}
							class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
						>
							<UserPlus class="h-4 w-4 mr-2" />
							Add Student
						</button>
						<button
							onclick={() => showBulkModal = true}
							class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
						>
							<Upload class="h-4 w-4 mr-2" />
							Bulk Upload
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<div class="bg-white shadow rounded-md p-8">
				<div class="animate-pulse">
					<div class="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
					<div class="h-4 bg-gray-300 rounded w-full mb-2"></div>
					<div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
					<div class="h-4 bg-gray-300 rounded w-1/2"></div>
				</div>
			</div>
		{/if}

		<!-- Instructions -->
		<div class="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
			<div class="flex">
				<AlertCircle class="h-5 w-5 text-blue-400" />
				<div class="ml-3">
					<h3 class="text-sm font-medium text-blue-800">
						Instructions
					</h3>
					<div class="mt-2 text-sm text-blue-700">
						<ul class="list-disc pl-5 space-y-1">
							<li>Enter scores between 0 and 30 marks for each student</li>
							<li>You can save your progress as a draft and return later</li>
							<li>Once submitted, scores cannot be edited</li>
							<li>Add individual students from any department/level using the "Add Student" button</li>
							<li>Upload multiple students at once using the "Bulk Upload" feature with a CSV file</li>
							<li>Students from different departments or levels can be added (supports carry overs, borrowed courses, etc.)</li>
							<li>Edit individual student information using the edit icon in the Actions column</li>
							<li>Delete students using the delete icon in the Actions column (only allowed before submission)</li>
							<li>Download the CSV template to see the required format for bulk uploads</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Add Student Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-10 mx-auto p-6 border w-[600px] shadow-lg rounded-md bg-white">
			<div class="flex justify-between items-center mb-6">
				<h3 class="text-lg font-medium text-gray-900">Add Student</h3>
				<button
					onclick={() => showAddModal = false}
					class="text-gray-400 hover:text-gray-600 text-2xl"
				>
					×
				</button>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					<div class="md:col-span-2">
						<label for="addName" class="block text-sm font-medium text-gray-700">Student Name *</label>
						<input
							type="text"
							id="addName"
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							placeholder="Full name"
						/>
					</div>
					
					<div>
						<label for="addRegNo" class="block text-sm font-medium text-gray-700">Registration Number *</label>
						<input
							type="text"
							id="addRegNo"
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							placeholder="e.g., CSC/2020/001"
						/>
					</div>
					
					<div>
						<label for="addLevel" class="block text-sm font-medium text-gray-700">Level *</label>
						<select
							id="addLevel"
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						>
							<option value="">Select Level</option>
							<option value="100">100 Level</option>
							<option value="200">200 Level</option>
							<option value="300">300 Level</option>
							<option value="400">400 Level</option>
							<option value="500">500 Level</option>
							<option value="600">600 Level</option>
							<option value="700">700 Level</option>
							<option value="800">800 Level</option>
						</select>
					</div>
					
					<div>
						<label for="addDepartment" class="block text-sm font-medium text-gray-700">Department *</label>
						<select
							id="addDepartment"
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						>
							<option value="">Select Department</option>
							{#each departments as dept}
								<option value={dept.id}>{dept.name}</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label for="addScore" class="block text-sm font-medium text-gray-700">Score (0-30)</label>
						<input
							type="number"
							id="addScore"
							min="0"
							max="30"
							step="0.5"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							placeholder="Optional"
						/>
					</div>
					
					<div>
						<label for="addStatus" class="block text-sm font-medium text-gray-700">Status</label>
						<select
							id="addStatus"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						>
							<option value="ACTIVE">Active</option>
							<option value="INACTIVE">Inactive</option>
						</select>
					</div>
				</div>

				<div class="flex justify-end space-x-3">
					<button
						type="button"
						onclick={() => showAddModal = false}
						disabled={adding}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={() => addNewStudent()}
						disabled={adding}
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if adding}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
							Adding...
						{:else}
							<UserPlus class="h-4 w-4 mr-2" />
							Add Student
						{/if}
					</button>
				</div>
		</div>
	</div>
{/if}

<!-- Bulk Upload Modal -->
{#if showBulkModal}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-10 mx-auto p-6 border w-[700px] shadow-lg rounded-md bg-white">
			<div class="flex justify-between items-center mb-6">
				<h3 class="text-lg font-medium text-gray-900">Bulk Upload Students</h3>
				<button
					onclick={() => showBulkModal = false}
					class="text-gray-400 hover:text-gray-600 text-2xl"
				>
					×
				</button>
			</div>

			<div class="mb-6">
				<div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
					<div class="flex">
						<AlertCircle class="h-5 w-5 text-blue-400" />
						<div class="ml-3">
							<h4 class="text-sm font-medium text-blue-800">Upload Instructions</h4>
							<div class="mt-2 text-sm text-blue-700">
								<ul class="list-disc pl-5 space-y-1">
									<li>Upload a CSV file with the following columns: name, regno, level, department, score (optional), status (optional)</li>
									<li>The first row must contain the column headers</li>
									<li>Level should be a number (100, 200, 300, 400, 500, 600, 700, 800)</li>
									<li>Department should be the full name (Computer Science, Information Technology, or Cyber Security)</li>
									<li>Score should be between 0-30 (leave empty if not available)</li>
									<li>Status can be ACTIVE or INACTIVE (defaults to ACTIVE)</li>
									<li>Students can be from any department or level (supports carry overs, borrowed courses, etc.)</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<div class="flex justify-center mb-4">
					<button
						onclick={downloadTemplate}
						class="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
					>
						<Download class="h-4 w-4 mr-2" />
						Download Template
					</button>
				</div>
			</div>

			<div class="mb-6">
				<label for="bulkFile" class="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
				<input
					type="file"
					id="bulkFile"
					accept=".csv,.xlsx,.xls"
					required
					class="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:border-blue-500"
				/>
			</div>

			<div class="flex justify-end space-x-3">
				<button
					type="button"
					onclick={() => showBulkModal = false}
					disabled={uploading}
					class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={() => bulkUpload()}
					disabled={uploading}
					class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if uploading}
						<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						Uploading...
					{:else}
						<Upload class="h-4 w-4 mr-2" />
						Upload Students
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Student Modal -->
{#if showEditModal && editingStudent}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="relative top-10 mx-auto p-6 border w-[600px] shadow-lg rounded-md bg-white">
			<div class="flex justify-between items-center mb-6">
				<h3 class="text-lg font-medium text-gray-900">Edit Student</h3>
				<button
					onclick={() => {
						showEditModal = false;
						editingStudent = null;
					}}
					class="text-gray-400 hover:text-gray-600 text-2xl"
				>
					×
				</button>
			</div>

			<div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					<div class="md:col-span-2">
						<label for="editName" class="block text-sm font-medium text-gray-700">Student Name *</label>
						<input
							type="text"
							id="editName"
							required
							value={editingStudent.name}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							placeholder="Full name"
						/>
					</div>
					
					<div>
						<label for="editRegNo" class="block text-sm font-medium text-gray-700">Registration Number *</label>
						<input
							type="text"
							id="editRegNo"
							required
							value={editingStudent.regNo}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							placeholder="e.g., CSC/2020/001"
						/>
					</div>
					
					<div>
						<label for="editLevel" class="block text-sm font-medium text-gray-700">Level *</label>
						<select
							id="editLevel"
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						>
							<option value="">Select Level</option>
							<option value="100" selected={editingStudent.level === 100}>100 Level</option>
							<option value="200" selected={editingStudent.level === 200}>200 Level</option>
							<option value="300" selected={editingStudent.level === 300}>300 Level</option>
							<option value="400" selected={editingStudent.level === 400}>400 Level</option>
						</select>
					</div>
					
					<div>
						<label for="editDepartment" class="block text-sm font-medium text-gray-700">Department *</label>
						<select
							id="editDepartment"
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						>
							<option value="">Select Department</option>
							{#each data.departments as department}
								<option value={department.id} selected={editingStudent.departmentId === department.id}>
									{department.name}
								</option>
							{/each}
						</select>
					</div>
					
					<div>
						<label for="editScore" class="block text-sm font-medium text-gray-700">Score (0-30)</label>
						<input
							type="number"
							id="editScore"
							min="0"
							max="30"
							step="0.5"
							value={editingStudent.score?.score || ''}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							placeholder="Optional"
						/>
					</div>
					
					<div>
						<label for="editStatus" class="block text-sm font-medium text-gray-700">Status</label>
						<select
							id="editStatus"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						>
							<option value="ACTIVE" selected={editingStudent.activeStatus === true}>Active</option>
							<option value="INACTIVE" selected={editingStudent.activeStatus === false}>Inactive</option>
						</select>
					</div>
				</div>

				<div class="flex justify-end space-x-3">
					<button
						type="button"
						onclick={() => {
							showEditModal = false;
							editingStudent = null;
						}}
						disabled={editing}
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={() => updateStudent()}
						disabled={editing}
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if editing}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
							Updating...
						{:else}
							<Edit class="h-4 w-4 mr-2" />
							Update Student
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Notification -->
<ModalNotification
	bind:show={showNotification}
	type={notificationType}
	title={notificationTitle}
	message={notificationMessage}
	confirmText={notificationConfirmText}
	cancelText={notificationCancelText}
	showCancel={showNotificationCancel}
	onConfirm={notificationOnConfirm}
	onCancel={notificationOnCancel}
/>
