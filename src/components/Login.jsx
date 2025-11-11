import React, { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom"
import {LogIn, Eye, EyeOff} from "lucide-react"
import {toast, ToastContainer} from 'react-toastify';
import {BUTTON_CLASSES, INPUTWRAPPER, FIELDS} from '../assets/dummy'
import axios from "axios";

const INITIAL_FORM = {email:"", password:""}

const Login = ({ onSubmit, onSwitchMode}) => {
    
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(INITIAL_FORM)
    const [isShowPassword, setIsShowPassword] = useState(false)

    const navigate = useNavigate()
    const url = 'http://localhost:7000'

    useEffect(() => {
        const token = localStorage.getItem("token")
        const userId = localStorage.getItem("userId")
        if (token) {
            (async () => {
                try {
                    const {data} = await axios.get(`${url}/api/user/me`, {
                        headers: {Authorization: `Bearer ${token}`},
                    })
                    if (data.success) {
                        onSubmit?.({token, userId, ...data.user})
                        toast.success("Session restored. Redirecting...")
                        navigate('/')
                    }
                    else{
                        localStorage.clear()
                    }
                } catch (error) {
                    localStorage.clear()
                }
            })()
        }
    }, [navigate, onSubmit])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!rememberMe) {
            toast.error('You may enable "Remember Me" to login.')
            return
        }
        setLoading(true)

        try {
            const {data} = await axios.post(`${url}/api/user/login`, formData)
            if(!data.token) throw new Error(data.message || "Login failed")

            localStorage.setItem("token", data.token)
            localStorage.setItem("userId", data.user.id)
            setFormData(INITIAL_FORM)
            onSubmit?.({token:data.token, userId:data.user.id, ...data.user})
            toast.success("Login successful! Redirecting...")
            setTimeout(() => navigate("/"), 1000)
        } catch (error) {
            const message = error.response?.data?.message || error.message
            toast.error(message)
        }
        finally {
            setLoading(false)
        }
    }

    const handleSwitchMode = () => {
        toast.dismiss()
        onSwitchMode?.()
    }

    return (
        <div className="max-w-sm bg-white shadow-lg border border-blue-100 rounded-xl p-6">
            <ToastContainer position='top-center' autoClose={3000} hideProgressBar/>

            <div className="mb-4 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-blue-600
                rounded-full mx-auto flex items-center justify-center mb-3">
                    <LogIn className='w-7 h-7 text-white'/>
                </div>

                <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>

                <p className="text-gray-500 text-sm mt-1">Sign in to continue to Task Manager</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                {FIELDS.filter(field => field.name !== 'name').map(({name, type, placeholder, icon: Icon,}) => (
                    <div key={name} className={INPUTWRAPPER}>
                        <Icon className="text-fuchsia-500 w-5 h-5"/>
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

                <div>
                    <input  
                    type="checkbox" 
                    id="rememberMe" 
                    checked={rememberMe} 
                    onChange={() => setRememberMe(!rememberMe)} 
                    className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"/>

                    <label 
                    htmlFor="rememberMe"
                    className="ml-2 text-sm text-gray-700">Remember Me</label>
                </div>

                <button type="submit" className={BUTTON_CLASSES} disabled={loading}>
                    {loading ? (
                        "Logging in..."
                    ) : (
                        <>
                        <LogIn className="w-4 h-4"/>
                            Login
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <button 
                type="button" 
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                onClick={handleSwitchMode}>
                    Sign Up 
                </button>
            </p>
        </div>
    )
}

export default Login;
