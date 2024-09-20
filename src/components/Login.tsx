import React, { useState } from "react";
import { FiUser, FiLock } from "react-icons/fi";
import { useMutation } from "@apollo/client/react/hooks/useMutation";
import { LOGIN_MUTATION } from "../graphql/mutations/login";
import { SEND_RESET_PASSWORD_EMAIL } from "../graphql/mutations/sendResetPasswordEmail";
import Modal from "./Modal";

interface ErrorMessage {
    title: string;
    message: string;
}

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<ErrorMessage>();

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    
    const [loginMutation] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            console.log("login successful", data);
        },
        onError: (error) => {
            console.error("login error:", error);

            if (error.message === "You should reset your password.") {
                setErrorMessage({
                    title: error.message,
                    message:
                        "An email containing reset password link will be sent to the member. Are you sure you want to continue?",
                });
                openModal();
            }
        },
    });

    const [sendResetPasswordEmail] = useMutation(SEND_RESET_PASSWORD_EMAIL, {
        onCompleted: (data) => {
            console.log("Send email completed:", data);
        },
        onError: (error) => {
            console.error("Send Email error:", error);
        },
    });
    const variables = {
        input: {
            usernameOrEmail: email,
            password: password,
        },
    };
    const onLogin = async () => {
        try {
            const { data } = await loginMutation({
                variables: variables,
            });
            console.log("data", data);

            if (data?.login?.token) {
                localStorage.setItem("authToken", data.login.token);
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    };
    const emailVariables = { email: email };
    const sendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await sendResetPasswordEmail({
                variables: emailVariables,
            });
            console.log("data", data);
        } catch (error) {
            console.error("Send Email error:", error);
        }
    };
    return (
        <div className="min-h-screen w-full bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-center text-3xl font-bold text-gray-800">
                    Login to Your Account
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="flex items-center border border-gray-300 p-2 rounded-md">
                        <FiUser className="text-gray-400" />
                        <input
                            type="email"
                            required
                            className="ml-2 w-full p-1 outline-none"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center border border-gray-300 p-2 rounded-md">
                        <FiLock className="text-gray-400" />
                        <input
                            type="password"
                            required
                            className="ml-2 w-full p-1 outline-none"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md"
                    >
                        Log In
                    </button>
                </form>
                <p className="text-center text-gray-600">
                    Don't have an account?{" "}
                    <a href="/signup" className="text-purple-600">
                        Sign up
                    </a>
                </p>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h2 className="text-xl font-semibold mb-4">
                    {errorMessage?.title}
                </h2>
                <p className="mb-4">{errorMessage?.message}</p>
                <button
                    className="border border-gray-500 px-4 py-2 rounded-lg hover:border-black transition duration-300"
                    onClick={closeModal}
                >
                    Close
                </button>
                <button
                    className="bg-blue-500 ml-10 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    onClick={sendEmail}
                >
                    Yes
                </button>
            </Modal>
        </div>
    );
};

export default LoginPage;
