import React, { useCallback, useEffect, useState } from "react";
import { baseControlClasses, DEFAULT_TASK, priorityStyles } from "../assets/dummy";
import { AlignLeft, Calendar, CheckCircle, Flag, PlusCircle, Save, X } from "lucide-react";

const API_URL = 'http://localhost:7000/api/tasks'

const TaskModal = ({isOpen, onClose, taskToEdit, onSave, onLogout}) => {

    const [taskData, setTaskData] = useState(DEFAULT_TASK)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null) 
    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        if(!isOpen) return;
        if(taskToEdit) {
            const normalized = taskToEdit.completed === 'Yes' || taskToEdit.completed === true ? 'Yes' : 'No';
            setTaskData({
                ...DEFAULT_TASK,
                title: taskToEdit.title || '',
                description: taskToEdit.description || '',
                priority: taskToEdit.priority || 'Low',
                dueDate: taskToEdit.dueDate?.split('T')[0] || '',
                completed: normalized,
                id: taskToEdit._id,
            });
        }
        else {
            setTaskData(DEFAULT_TASK)
        }
        setError(null)
    }, [isOpen, taskToEdit])

    const handleChange = useCallback((e) => {
        const {name, value} = e.target;
        setTaskData(prev => ({...prev, [name]: value}))
    }, [])

    const getHeaders = useCallback(() => {
        const token = localStorage.getItem('token')
        if (!token) throw new Error("No auth token found");
        return {
            'Content-Type' : 'application/json',
            Authorization : `Bearer ${token}`
        }
    }, [])

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (taskData.dueDate < today) {
            setError('Due date cannot bein the past.');
            return;
        }
        setError(null);
        setLoading(true);

        try {
            const isEdit=Boolean(taskData.id)
            const url = isEdit ? `${API_URL}/${taskData.id}/tm` : `${API_URL}/tm`
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: getHeaders(),
                body : JSON.stringify(taskData),
            });
            if (!response.ok) {
                if (response.status === 401) return onLogout?.();
                const error = await response.json();
                throw new Error(error.message || "Failed to save task");
            }
            const saved = await response.json()
            onSave?.(saved)
            onClose();
        } catch (error) {
            console.error(error);
            setError(error.message || "An expected err occured")
        }
        finally {
            setLoading(false)
        }
    }, [taskData, today, getHeaders, onClose, onLogout, onSave])

    if(!isOpen) return null

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center
        p-4">
            <div className="bg-white border border-blue-100 rounded-xl max-w-md w-full
            shadow-lg relative p-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {taskData.id ? <Save className="text-blue-500 w-5 h-5"/> :
                        <PlusCircle className="text-blue-500 w-5 h-5"/>}
                        {taskData.id ? 'Edit Task' : 'Create New Task'}
                    </h2>

                    <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-gray-500
                    hover:text-blue-700">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                {/*FORM TO FILL TO CREATE A TASK */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>

                        <div className="flex items-center border border-blue-100 rounded-lg px-3 py-2.5 focus-within:ring-2
                        focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
                            <input type="text" name="title" required value={taskData.title} onChange={handleChange} 
                                   className="w-full focus:outline-none text-sm" placeholder="Enter task title"/>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            <AlignLeft className="w-4 h-4 text-blue-500"/>Description
                        </label>

                        <textarea name="description" rows="3"
                        onChange={handleChange} value={taskData.description} className={baseControlClasses}
                        placeholder="Add details about task"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                                <Flag className="w-4 h-4 text-blue-500"/>Priority
                             </label>

                             <select name="priority" value={taskData.priority} onChange={handleChange} 
                             className={`${baseControlClasses} ${priorityStyles[taskData.priority]}`}>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                             </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 text-blue-500"/>Due Date
                             </label>

                             <input type="date" name="dueDate" required min={today} value={taskData.dueDate}
                                    onChange={handleChange} className={baseControlClasses}/>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                            <CheckCircle className="w-4 h-4 text-blue-500"/>Status
                        </label>

                        <div className="flex gap-4">
                            {[{value: 'Yes', label: 'Completed'}, {value: 'No', label: 'In Progress'}].map(({value, label}) => (
                                <label key={value} className="flex items-center">
                                    <input type="radio" name='completed' value={value} checked={taskData.completed === value}
                                           onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 
                                           border-gray-300 rounded"/>
                                           <span className="ml-2 text-sm text-gray-700">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-fuchsia-500 to-blue-600 text-white font-medium py-2.5 px-4 flex
                    rounded-lg items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md transition-all duration-200">
                        {loading ? 'Saving...' : (taskData.id ? <>
                        <Save className="w-4 h-4"/>Update Task
                         </> : <>
                         <PlusCircle className="w-4 h-4"/>Create Task
                         </>
                         )}

                    </button>
                </form>
            </div>
        </div>
    )
}

export default TaskModal