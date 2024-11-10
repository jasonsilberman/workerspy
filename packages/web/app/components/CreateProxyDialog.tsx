import { Form, useNavigation } from "@remix-run/react";
import {
	Button,
	Dialog,
	Heading,
	Modal,
	ModalOverlay,
} from "react-aria-components";

interface CreateProxyDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export function CreateProxyDialog({ isOpen, onClose }: CreateProxyDialogProps) {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<ModalOverlay
			isOpen={isOpen}
			onOpenChange={(isOpen) => !isOpen && onClose()}
			isDismissable
			className={({ isEntering, isExiting }) => `
        fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4
        ${isEntering ? "animate-in fade-in duration-200" : ""}
        ${isExiting ? "animate-out fade-out duration-150" : ""}
      `}
		>
			<Modal
				className={({ isEntering, isExiting }) => `
          bg-white rounded-lg w-full max-w-md
          ${isEntering ? "animate-in zoom-in-95 duration-200" : ""}
          ${isExiting ? "animate-out zoom-out-95 duration-150" : ""}
        `}
			>
				<Dialog className="p-6 outline-none">
					<Heading className="text-xl font-bold mb-4">Create New Proxy</Heading>
					<Form method="post" className="space-y-4" onSubmit={() => onClose()}>
						<fieldset disabled={isSubmitting}>
							<div>
								<label
									htmlFor="target"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Target URL
								</label>
								<input
									type="url"
									id="target"
									name="target"
									required
									className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-sm disabled:bg-gray-50 disabled:text-gray-500"
									placeholder="https://api.example.com"
								/>
								<p className="mt-1 text-sm text-gray-500">
									Enter the URL you want to proxy requests to
								</p>
							</div>
							<div className="flex justify-end gap-2 mt-4">
								<Button
									onPress={onClose}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
								>
									{isSubmitting ? "Creating..." : "Create"}
								</Button>
							</div>
						</fieldset>
					</Form>
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}
