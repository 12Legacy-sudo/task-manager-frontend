import React, { useState } from "react";
import {UserPlus, Eye, EyeOff} from "lucide-react";
import axios from "axios";
import {BUTTONCLASSES, FIELDS, Inputwrapper, MESSAGE_ERROR, MESSAGE_SUCCESS} from "../assets/dummy";

    const API_URL = "http://localhost:7000"
    const INITIAL_FORM = {name: "",email: "",password: ""}

const SignUp = ({onSwitchMode}) => {

    const [formData, setFormData] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({text:"", type:""})
    const [isShowPassword, setIsShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({text:"", type:""})

        try {
            const {data} = await axios.post(`${API_URL}/api/user/register`, formData)
            console.log("SignUp success", data);
            setMessage({text:"Register success.You may log in", type:"success"})
            setFormData(INITIAL_FORM)
        } catch (error) {
            console.error("SignUp error", error);
            setMessage({text: error.response?.data?.message || "An error occured.Please try again later", type:"error"})
        }
        finally{
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md w-full bg-white shadow-lg border border-blue-100 rounded-xl
        p-8">
            <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-blue-600
                rounded-full mx-auto flex items-center justify-center mb-4">
                    <UserPlus className="w-8 h-8 text-white"/>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800">
                    Create Account 
                </h2>
                <p className="text-gray-500 text-sm mt-1">Join Task Manager App.To manage tasks</p>
            </div>
            {message.text && (
                <div className={message.type === 'success' ? MESSAGE_SUCCESS:MESSAGE_ERROR}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {FIELDS.map(({name, type, placeholder, icon:Icon}) => (
                    <div key={name} className={Inputwrapper}>
                        <Icon className="text-blue-500 w-5 h-5 mr-2"/>
                        <input type={name === 'password' ? (isShowPassword ? 'text' : 'password') : type} placeholder={placeholder} value={formData[name]} 
                        onChange={(e) => setFormData({...formData, [name]: e.target.value})}
                        className="w-full focus:outline-none text-sm text-gray-700" required />
                        
                 {name === 'password' && (
                    isShowPassword ? (
                        <Eye 
                        size={20}
                        className="text-blue-600 cursor-pointer"
                        onClick={() => setIsShowPassword(false)}/>
                    ) : (
                        <EyeOff
                        size={20}
                        className="text-blue-600 cursor-pointer"
                        onClick={() => setIsShowPassword(true)}/>
                    )
                 )}

                    </div>
                ))}

                <button type="submit" className={BUTTONCLASSES} disabled={loading}>
                    {loading ? "Signing Up..." : <><UserPlus className="w-4 h-4"/>Sign Up</>}
                </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{' '}
                <button onClick={onSwitchMode} className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors">
                    Login 
                </button>
            </p>
        </div>
    )
}

export default SignUp; 
