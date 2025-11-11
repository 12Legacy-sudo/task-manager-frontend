import React, { useCallback, useState } from "react";
import {ADD_BUTTON, EMPTY_STATE, FILTER_LABELS, FILTER_OPTIONS, FILTER_WRAPPER, HEADER, ICON_WRAPPER, LABEL_CLASS, SELECT_CLASSES, STAT_CARD, STATS, STATS_GRID, TAB_ACTIVE, TAB_BASE, TAB_INACTIVE, TABS_WRAPPER, VALUE_CLASS, WRAPPER} from '../assets/dummy'
import { Calendar, Filter, HomeIcon, Plus } from "lucide-react";
import { useMemo } from "react";
import {useOutletContext} from 'react-router-dom'
import TaskItem from "../components/TaskItem";
import axios from 'axios'
import TaskModal from "../components/TaskModal";

const API_URL = 'http://localhost:7000/api/tasks'

const Dashboard = () => {

    const {tasks, refreshTasks} = useOutletContext()
    const [showModal, setShowModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [filter, setFilter] = useState("all")
    
    const stats = useMemo(() => ({
        total: tasks.length,
        lowPriority: tasks.filter(t => t.priority?.toLowerCase() === 'low').length,
        mediumPriority: tasks.filter(t => t.priority?.toLowerCase() === 'medium').length,
        highPriority: tasks.filter(t => t.priority?.toLowerCase() === 'high').length,
        completed: tasks.filter(t => t.completed === true || t.completed === 1 || (
            typeof t.completed === 'string' && t.completed.toLowerCase() === 'yes'
        )).length
    }), [tasks])

    //FILTER TASK
    const filteredTasks = useMemo(() => tasks.filter(tasks => {
        const dueDate = new Date(tasks.dueDate)
        const today = new Date()
        const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7)
        switch (filter) {
            case "today":
                return dueDate.toDateString() === today.toDateString()
            case "week":
                return dueDate >= today && dueDate <= nextWeek
            case "high":
            case "medium":
            case "low":
                return tasks.priority?.toLowerCase() === filter
            default:
                return true
        }
    }), [tasks, filter])

    //SAVING
    const handleTaskSave = useCallback(async (taskData) => {
        try {
            if (taskData.id) await axios.put(`${API_URL}/${taskData.id}/tm`, taskData)
            refreshTasks()
            setShowModal(false)
            setSelectedTask(null)
        } catch (error) {
            console.error("Error saving task", error);
        }
    }, [refreshTasks])

    return (
        <div className={WRAPPER}>
            {/*HEADERS*/}
            <div className={HEADER}>
                <div className="min-w-0">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <HomeIcon className="text-blue-500 w-5 h-5 md:w-6 md:h-6 shrink-0"/>
                        <span className="truncate">Task OverView</span>
                    </h1>

                    <p className="text-sm text-gray-500 mt-1 ml-7truncate">Manage your task proficiently.</p>
                </div>

                <button onClick={() => setShowModal(true)} className={ADD_BUTTON}>
                    <Plus size={18}/>
                    Add new Task
                </button>
            </div>

            {/*STATS*/}
            <div className={STATS_GRID}>
                {STATS.map(({key, label, icon:Icon, iconColor, borderColor="border-blue-100", valueKey, gradient, textColor}) => (
                    <div key={key} className={`${STAT_CARD} ${borderColor}`}>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className={`${ICON_WRAPPER} ${iconColor}`}>
                                <Icon className="w-4 h-4 md:w-5 md:h-5"/>
                            </div>

                            <div className="min-w-0">
                                <p className={`${VALUE_CLASS} ${gradient ? 
                                "bg-gradient-to-r from-fuchsia-500 to-blue-600 bg-clip-text text-transparent" : textColor}`}>
                                    {stats[valueKey]}
                                </p>
                                <p className={LABEL_CLASS}>{label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/*CONTENT */}
            <div className="space-y-6">
                {/*FILTER */}
                <div className={FILTER_WRAPPER}>
                    <div className="flex items-center gap-2 min-w-0">
                        <Filter className="w-5 h-5 text-blue-500 shrink-0"/> 
                        <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">
                            {FILTER_LABELS[filter]} 
                        </h2>
                    </div>

                    <select value={filter} onChange={(e) => setFilter(e.target.value)}
                        className={SELECT_CLASSES}>
                            {FILTER_OPTIONS.map(option => <option key={option} value={option}>
                                {option.charAt(0).toLowerCase() + option.slice(1)}
                            </option>)}
                        </select>

                        <div className={TABS_WRAPPER}>
                            {FILTER_OPTIONS.map(option => (
                                <button key={option} onClick={() => setFilter(option)} className={`${TAB_BASE} ${filter === option ? 
                                    TAB_ACTIVE : TAB_INACTIVE}`}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </button>
                            ))}
                        </div>
                </div>

                {/*TASK LIST */}
                <div className="space-y-4">
                    {filteredTasks.length === 0 ? (
                        <div className={EMPTY_STATE.wrapper}>
                            <div className={EMPTY_STATE.iconWrapper}>
                                <Calendar className="w-8 h-8 text-blue-500"/>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">No tasks found</h3>
                                <p className="text-sm text-gray-500 mb-4">{filter === "all" ? 
                                "Create your first task to get started" : "No task match this filter"}</p>
                                <button onClick={() => setShowModal(true)} className={EMPTY_STATE.btn}>Add New Task</button>
                            
                        </div>
                    ): (
                        filteredTasks.map(task => (
                            <TaskItem key={task._id || task.id} 
                            task={task}
                            onRefresh={refreshTasks}
                            showCompleteCheckbox
                            onEdit={() => {setSelectedTask(task); setShowModal(true)}}/> 
                        ))
                    )}
                </div>

                {/*ADD TASK DESKTOP */}
                <div className="hidden md:flex items-center justify-center p-4 border-2 border-dashed border-blue-200 rounded-xl
                hover:border-blue-400 bg-blue-50/50 cursor-pointer transiton-colors"
                onClick={() => setShowModal(true)}>
                    <Plus className="w-5 h-5 text-blue-500 mr-2"/>
                    <span className="text-gray-600 font-medium">Add New Task</span>
                </div>
            </div>

            {/*MODAL */}
            <TaskModal isOpen={showModal || !!selectedTask}
            onClose={() => {setShowModal(false); setSelectedTask(null)}}
            taskToEdit={selectedTask}
            onSave={handleTaskSave}/>
        </div>
    )
}

export default Dashboard;
