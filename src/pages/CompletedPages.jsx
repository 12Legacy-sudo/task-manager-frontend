import React, { useMemo } from "react";
import {CT_CLASSES, SORT_OPTIONS} from '../assets/dummy'
import { CheckCircle2, Filter } from "lucide-react";
import {useOutletContext} from 'react-router-dom'
import { useState } from "react";
import TaskItem from "../components/TaskItem";

const CompletedPages = () => {

    const {tasks, refreshTasks} = useOutletContext()
    const [sortBy, setSortBy] = useState('newest')

    const sortedCompletedTasks = useMemo (() => {
        return tasks
        .filter(task => [true, 1, 'yes'].includes(
            typeof task.completed === 'string' ? task.completed.toLowerCase()
            : task.completed
        ))
        .sort((a,b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date (a.createdAt)
                case 'oldest':
                    return  new Date(a.createdAt) - new Date (b.createdAt)
                case 'priority':
                    const order = {high: 3, medium: 2, low: 1}
                    return order[b.priority?.toLowerCase()] - order[a.priority?.toLowerCase()]
                default:
                    return 0
            }
        })
    }, [tasks, sortBy])

    return(
        <div className={CT_CLASSES}>
            {/*HEADERS*/}
            <div className={CT_CLASSES.header}>
                <div className={CT_CLASSES.titleWrapper}>
                    <h1 className={CT_CLASSES.title}>
                        <CheckCircle2 className="text-blue-500 w-5 h-5 md:w-6 md:h-6"/>
                        <span className="truncate">Completed Tasks</span>
                    </h1>

                    <p className={CT_CLASSES.subtitle}>
                        {sortedCompletedTasks.length} task{sortedCompletedTasks.length !== 1 && 's'} {' '}
                        mark as complete
                    </p>
                </div>

                {/* SORT */}
                <div className={CT_CLASSES.sortContainer}>
                    <div className={CT_CLASSES.sortBox}>
                        <div className={CT_CLASSES.filterLabel}>
                            <Filter className="w-4 h-4 text-blue-500"/>
                            <span className="text-xs md:text-sm">Sort By:</span>
                        </div>

                        {/* MOBILE DROPDOWN */}
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                            className={CT_CLASSES.select}>
                                {SORT_OPTIONS.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                        {option.id === 'newest' ? 'First' : ''}
                                    </option>
                                ))}
                            </select>

                            {/* DESKTOP BTN */}
                            <div className={CT_CLASSES.btnGroup}>
                                {SORT_OPTIONS.map(option => (
                                    <button key={option.id} onClick={() => setSortBy(option.id)}
                                    className={[
                                        CT_CLASSES.btnBase,
                                        sortBy === option.id ? CT_CLASSES.btnActive : CT_CLASSES.btnInactive
                                    ].join(" ")}>
                                        {option.icon}
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                    </div>
                </div>
            </div>

            {/* TASK LIST */}
            <div className={CT_CLASSES.list}>
                {sortedCompletedTasks.length === 0 ? (
                    <div className={CT_CLASSES.emptyState}>
                        <div className={CT_CLASSES.emptyIconWrapper}>
                            <CheckCircle2 className="w-6 h-6 md:h-8 text-blue-500"/>
                        </div>
                        <h3 className={CT_CLASSES.emptyTitle}>
                            No task completed
                        </h3>
                        <p className={CT_CLASSES.emptyText}>
                            Complete some task and they'll appear here
                        </p>
                    </div>
                ) : (
                    sortedCompletedTasks.map(task => (
                        <TaskItem key={task._id || task.id}
                                  task={task}
                                  onRefresh={refreshTasks}
                                  showCompleteCheckbox={false}
                                  className='opacity-90 hover:opacity-100 transition-opacity text-sm md:text-base'/>
                    ))
                )}
            </div>
        </div>
    )
}

export default CompletedPages