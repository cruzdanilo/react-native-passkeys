import ExpoModulesCore

// - navigator.credentials.create request options
internal struct PublicKeyCredentialCreationResponse {

    // TODO: figure out why I am forced to make these optional or get a 'No exact matches in call to initializer' error
    @Field
    var rp: PublicKeyCredentialRpEntity?

    @Field
    var user: PublicKeyCredentialUserEntity?

    @Field
    var challenge: Base64URLString

    @Field
    var pubKeyCredParams: [PublicKeyCredentialParameters]

    @Field
    var timeout: Int?

    @Field
    var excludeCredentials: [PublicKeyCredentialDescriptor]?

    @Field
    var authenticatorSelection: AuthenticatorSelectionCriteria?

    @Field
    var attestation: AttestationConveyancePreference?

    @Field
    var extensions: AuthenticationExtensionsClientInputs?

}
