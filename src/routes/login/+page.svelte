<script lang="ts">
	import { enhance } from '$app/forms';
	import { BookOpen, Mail, Lock, AlertCircle } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';

	let { form, data }: { form: ActionData; data: PageData } = $props();

	let loading = $state(false);
</script>

<svelte:head>
	<title>Login - ScoreFlow</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<div class="flex justify-center">
				<BookOpen class="h-12 w-12 text-blue-600" />
			</div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Sign in to ScoreFlow
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Continuous Assessment Records Management Portal
			</p>
		</div>

		<form 
			method="POST" 
			class="mt-8 space-y-6"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
		>
			{#if data.message}
				<div class="flex items-center p-4 mb-4 text-green-800 bg-green-50 rounded-lg border border-green-200">
					<div class="text-sm">
						{data.message}
					</div>
				</div>
			{/if}

			{#if form?.error}
				<div class="flex items-center p-4 mb-4 text-red-800 bg-red-50 rounded-lg border border-red-200">
					<AlertCircle class="h-5 w-5 mr-3" />
					<div class="text-sm">
						{form.error}
					</div>
				</div>
			{/if}

			<div class="rounded-md shadow-sm -space-y-px">
				<div>
					<label for="email" class="sr-only">Email address</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							class="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
							placeholder="Email address"
							value={form?.email ?? ''}
						/>
					</div>
				</div>
				<div>
					<label for="password" class="sr-only">Password</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="password"
							name="password"
							type="password"
							autocomplete="current-password"
							required
							class="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
							placeholder="Password"
						/>
					</div>
				</div>
			</div>

			<div>
				<button
					type="submit"
					disabled={loading}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
					{:else}
						Sign in
					{/if}
				</button>
			</div>

			<div class="text-center">
				<a 
					href="/forgot-password" 
					class="text-sm text-blue-600 hover:text-blue-500"
				>
					Forgot your password?
				</a>
			</div>

			<div class="text-center">
				<p class="text-xs text-gray-500">
					Use your institutional credentials to access the system
				</p>
			</div>
		</form>
	</div>
</div>
