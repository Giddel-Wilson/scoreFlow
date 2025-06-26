<script lang="ts">
	import type { PageData } from './$types';
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Mail, ArrowLeft } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSubmitting = false;
</script>

<svelte:head>
	<title>Forgot Password - ScoreFlow</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<h1 class="text-3xl font-bold text-gray-900">ScoreFlow</h1>
			<h2 class="mt-6 text-2xl font-bold text-gray-900">Reset your password</h2>
			<p class="mt-2 text-sm text-gray-600">
				Enter your email address and we'll send you a link to reset your password.
			</p>
		</div>

		{#if form?.success}
			<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
				<div class="flex items-center">
					<Mail class="h-5 w-5 mr-2" />
					<span>{form.success}</span>
				</div>
				<p class="mt-2 text-sm">Check your email for the reset link.</p>
			</div>
		{:else}
			<form method="POST" use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}} class="space-y-6">
				{#if form?.error}
					<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
						{form.error}
					</div>
				{/if}

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email address
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
						placeholder="Enter your email address"
					/>
				</div>

				<div>
					<button
						type="submit"
						disabled={isSubmitting}
						class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if isSubmitting}
							Sending...
						{:else}
							Send reset link
						{/if}
					</button>
				</div>
			</form>
		{/if}

		<div class="text-center">
			<a 
				href="/login" 
				class="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
			>
				<ArrowLeft class="h-4 w-4 mr-1" />
				Back to login
			</a>
		</div>
	</div>
</div>
