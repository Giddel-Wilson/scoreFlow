<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import { LogOut, User, BookOpen, FileText, Settings } from 'lucide-svelte';

	let { children, data }: { children: any; data: LayoutData } = $props();

	const user = $derived(data.user);
	const isAuthenticated = $derived(!!user);
	const isLoginPage = $derived($page.url.pathname === '/login');
</script>

<div class="min-h-screen bg-gray-50">
	{#if isAuthenticated && !isLoginPage}
		<nav class="bg-white shadow-sm border-b border-gray-200">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between h-16">
					<div class="flex items-center">
						<div class="flex-shrink-0 flex items-center">
							<BookOpen class="h-8 w-8 text-blue-600" />
							<span class="ml-2 text-xl font-semibold text-gray-900">ScoreFlow</span>
						</div>
						<div class="hidden sm:ml-10 sm:flex sm:space-x-8">
							<a
								href="/dashboard"
								class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
								class:!border-blue-500={$page.url.pathname === '/dashboard'}
								class:!text-blue-600={$page.url.pathname === '/dashboard'}
							>
								Dashboard
							</a>
							{#if user?.role === 'LECTURER'}
								<a
									href="/lecturer/courses"
									class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
									class:!border-blue-500={$page.url.pathname.startsWith('/lecturer')}
									class:!text-blue-600={$page.url.pathname.startsWith('/lecturer')}
								>
									My Courses
								</a>
							{/if}
							{#if user?.role === 'HOD'}
								<a
									href="/hod/department"
									class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
									class:!border-blue-500={$page.url.pathname.startsWith('/hod')}
									class:!text-blue-600={$page.url.pathname.startsWith('/hod')}
								>
									Department
								</a>
							{/if}
							{#if user?.role === 'ADMIN'}
								<a
									href="/admin/manage"
									class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
									class:!border-blue-500={$page.url.pathname.startsWith('/admin')}
									class:!text-blue-600={$page.url.pathname.startsWith('/admin')}
								>
									Administration
								</a>
							{/if}
						</div>
					</div>
					<div class="flex items-center space-x-4">
						<div class="flex items-center text-sm text-gray-500">
							<User class="h-4 w-4 mr-2" />
							<span class="font-medium">{user?.name}</span>
							<span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs uppercase">
								{user?.role}
							</span>
						</div>
						<form method="POST" action="/logout">
							<button
								type="submit"
								class="flex items-center text-gray-500 hover:text-red-600 transition-colors"
							>
								<LogOut class="h-4 w-4" />
							</button>
						</form>
					</div>
				</div>
			</div>
		</nav>
	{/if}

	<main class="flex-1">
		{@render children()}
	</main>
</div>
