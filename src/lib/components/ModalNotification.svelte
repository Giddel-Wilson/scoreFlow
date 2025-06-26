<!-- Modal Notification Component -->
<script lang="ts">
	import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-svelte';

	export let show = false;
	export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	export let title = '';
	export let message = '';
	export let confirmText = 'OK';
	export let cancelText = 'Cancel';
	export let showCancel = false;
	export let onConfirm: (() => void) | null = null;
	export let onCancel: (() => void) | null = null;

	function handleConfirm() {
		if (onConfirm) onConfirm();
		show = false;
	}

	function handleCancel() {
		if (onCancel) onCancel();
		show = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		}
	}

	const typeConfig = {
		success: {
			icon: CheckCircle,
			iconClass: 'text-green-500',
			bgClass: 'bg-green-50',
			borderClass: 'border-green-200'
		},
		error: {
			icon: AlertCircle,
			iconClass: 'text-red-500',
			bgClass: 'bg-red-50',
			borderClass: 'border-red-200'
		},
		warning: {
			icon: AlertTriangle,
			iconClass: 'text-yellow-500',
			bgClass: 'bg-yellow-50',
			borderClass: 'border-yellow-200'
		},
		info: {
			icon: Info,
			iconClass: 'text-blue-500',
			bgClass: 'bg-blue-50',
			borderClass: 'border-blue-200'
		}
	};

	$: config = typeConfig[type];
</script>

{#if show}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div 
		class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		aria-describedby="modal-description"
	>
		<div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
			<!-- Header -->
			<div class={`px-6 py-4 border-b ${config.borderClass} ${config.bgClass} rounded-t-lg`}>
				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<svelte:component this={config.icon} class={`h-6 w-6 ${config.iconClass} mr-3`} />
						<h3 id="modal-title" class="text-lg font-medium text-gray-900">
							{title}
						</h3>
					</div>
					<button
						type="button"
						class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
						onclick={handleCancel}
					>
						<X class="h-6 w-6" />
					</button>
				</div>
			</div>

			<!-- Body -->
			<div class="px-6 py-4">
				<p id="modal-description" class="text-sm text-gray-700">
					{message}
				</p>
			</div>

			<!-- Footer -->
			<div class="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
				{#if showCancel}
					<button
						type="button"
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						onclick={handleCancel}
					>
						{cancelText}
					</button>
				{/if}
				<button
					type="button"
					class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					onclick={handleConfirm}
				>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}
