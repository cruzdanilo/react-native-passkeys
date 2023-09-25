import type {
	AuthenticationCredential,
	AuthenticationExtensionsClientInputs,
	AuthenticationExtensionsClientOutputs,
	AuthenticationResponseJSON,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
	RegistrationCredential,
	RegistrationResponseJSON,
} from './ReactNativePasskeys.types'
import { NotSupportedError } from './errors'
import { base64URLStringToBuffer, bufferToBase64URLString } from './utils/base64'

export default {
	get name(): string {
		return 'ReactNativePasskeys'
	},

	isAutoFillAvalilable(): Promise<boolean> {
		const globalPublicKeyCredential = window.PublicKeyCredential

		if (globalPublicKeyCredential.isConditionalMediationAvailable === undefined)
			return new Promise((resolve) => resolve(false))

		return globalPublicKeyCredential.isConditionalMediationAvailable()
	},

	isSupported() {
		return (
			window?.PublicKeyCredential !== undefined && typeof window.PublicKeyCredential === 'function'
		)
	},

	async create({
		signal,
		...request
	}: PublicKeyCredentialCreationOptionsJSON &
		Pick<CredentialCreationOptions, 'signal'>): Promise<RegistrationResponseJSON | null> {
		if (!this.isSupported) throw new NotSupportedError()

		const credential = (await navigator.credentials.create({
			signal,
			publicKey: {
				...request,
				challenge: base64URLStringToBuffer(request.challenge),
				user: { ...request.user, id: base64URLStringToBuffer(request.user.id) },
				excludeCredentials: request.excludeCredentials?.map((credential) => ({
					...credential,
					id: base64URLStringToBuffer(credential.id),
					// TODO: remove the override when typescript has updated webauthn types
					transports: (credential.transports ?? undefined) as AuthenticatorTransport[] | undefined,
				})),
			},
		})) as RegistrationCredential

		// TODO: remove the override when typescript has updated webauthn types
		const clientExtensionResults =
			credential?.getClientExtensionResults() as AuthenticationExtensionsClientOutputs

		warnUserOfMissingWebauthnExtensions(request.extensions, clientExtensionResults)

		if (!credential) return null

		return {
			id: credential?.id,
			rawId: credential.id,
			response: {
				clientDataJSON: bufferToBase64URLString(credential.response.clientDataJSON),
				attestationObject: bufferToBase64URLString(credential.response.attestationObject),
			},
			authenticatorAttachment: undefined,
			type: 'public-key',
			clientExtensionResults,
		}
	},

	async get({
		mediation,
		signal,
		...request
	}: PublicKeyCredentialRequestOptionsJSON &
		Pick<
			CredentialRequestOptions,
			'mediation' | 'signal'
		>): Promise<AuthenticationResponseJSON | null> {
		const credential = (await navigator.credentials.get({
			mediation,
			signal,
			publicKey: {
				...request,
				challenge: base64URLStringToBuffer(request.challenge),
				allowCredentials: request.allowCredentials?.map((credential) => ({
					...credential,
					id: base64URLStringToBuffer(credential.id),
					// TODO: remove the override when typescript has updated webauthn types
					transports: (credential.transports ?? undefined) as AuthenticatorTransport[] | undefined,
				})),
			},
		})) as AuthenticationCredential

		// TODO: remove the override when typescript has updated webauthn types
		const clientExtensionResults =
			credential?.getClientExtensionResults() as AuthenticationExtensionsClientOutputs

		warnUserOfMissingWebauthnExtensions(request.extensions, clientExtensionResults)

		if (!credential) return null

		return {
			id: credential.id,
			rawId: credential.id,
			response: {
				clientDataJSON: bufferToBase64URLString(credential.response.clientDataJSON),
				authenticatorData: bufferToBase64URLString(credential.response.authenticatorData),
				signature: bufferToBase64URLString(credential.response.signature),
				userHandle: credential.response.userHandle
					? bufferToBase64URLString(credential.response.userHandle)
					: undefined,
			},
			authenticatorAttachment: undefined,
			clientExtensionResults,
			type: 'public-key',
		}
	},
}

/**
 *  warn the user about extensions that they tried to use that are not supported
 */
const warnUserOfMissingWebauthnExtensions = (
	requestedExtensions: AuthenticationExtensionsClientInputs | undefined,
	clientExtensionResults: AuthenticationExtensionsClientOutputs | undefined,
) => {
	if (clientExtensionResults) {
		for (const key in requestedExtensions) {
			console.log(key, clientExtensionResults[key])
			if (typeof clientExtensionResults[key] === 'undefined') {
				alert(
					`Webauthn extension ${key} is undefined -- your browser probably doesn't know about it`,
				)
			}
		}
	}
}
