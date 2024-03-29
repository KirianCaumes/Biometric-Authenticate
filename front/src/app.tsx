import { startAuthentication, startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useCallback, useState } from 'react';

function App() {
    const [message, setMessage] = useState('')

    const onRegister = useCallback(async () => {
        // Reset success/error messages
        setMessage("")

        // GET registration options from the endpoint that calls
        // @simplewebauthn/server -> generateRegistrationOptions()
        const resp = await fetch(`/api/biometric/register/option`);

        let attResp;
        try {
            // Pass the options to the authenticator and wait for a response
            attResp = await startRegistration(await resp.json());
        } catch (error: any) {
            // Some basic error handling
            if (error.name === 'InvalidStateError') {
                setMessage('Error: Authenticator was probably already registered by user')
            } else {
                setMessage(JSON.stringify(error))
            }

            throw error;
        }

        // POST the response to the endpoint that calls
        // @simplewebauthn/server -> verifyRegistrationResponse()
        const verificationResp = await fetch(`/api/biometric/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(attResp),
        });

        // Wait for the results of verification
        const verificationJSON = await verificationResp.json();

        // Show UI appropriate for the `verified` status
        if (verificationJSON && verificationJSON.verified) {
            setMessage('Success!')
        } else {
            setMessage(`Oh no, something went wrong! Response: <pre>${JSON.stringify(
                verificationJSON,
            )}</pre>`)
        }
    }, [])

    const onAuthenticate = useCallback(async () => {
        // Reset success/error messages
        setMessage("")

        // GET authentication options from the endpoint that calls
        // @simplewebauthn/server -> generateAuthenticationOptions()
        const resp = await fetch(`/api/biometric/authenticate/option`);

        const optionJson = await resp.json()

        let asseResp;
        try {
            // Pass the options to the authenticator and wait for a response
            asseResp = await startAuthentication(optionJson.options);
        } catch (error) {
            // Some basic error handling
            setMessage(JSON.stringify(error))
            throw error;
        }

        // POST the response to the endpoint that calls
        // @simplewebauthn/server -> verifyAuthenticationResponse()
        const verificationResp = await fetch(`/api/biometric/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requestId: optionJson.requestId, ...asseResp }),
        });

        // Wait for the results of verification
        const verificationJSON = await verificationResp.json();

        // Show UI appropriate for the `verified` status
        if (verificationJSON && verificationJSON.verified) {
            setMessage('Success!')
        } else {
            setMessage(`Oh no, something went wrong! Response: <pre>${JSON.stringify(
                verificationJSON,
            )}</pre>`)
        }
    }, [])

    return (
        <div className="App">
            <p>browserSupportsWebAuthn: {browserSupportsWebAuthn().toString()}</p>
            <p>Message: {message}</p>
            <hr />
            <br />
            <button
                type="button"
                onClick={onRegister}
            >
                Register as user "example"
            </button>
            <br />
            <br />
            <hr />
            <br />
            <button
                type="button"
                onClick={onAuthenticate}
            >
                Authenticate
            </button>
        </div>
    )
}

export default App
