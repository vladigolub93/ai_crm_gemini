
import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import type { Task } from '../types';

const TaskListView: React.FC = () => {
  const { tasks, addTask, toggleTask, leads, accounts } = useCrm();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [relatedTo, setRelatedTo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !dueDate || !relatedTo) {
        alert("Please fill out all fields.");
        return;
    }
    const [type, id] = relatedTo.split(':');
    const name = type === 'lead' 
        ? leads.find(l => l.id === id)?.name 
        : accounts.find(a => a.id === id)?.name;

    if(!name) {
        alert("Could not find related lead or account.");
        return;
    }

    addTask({
        title: newTaskTitle,
        dueDate,
        relatedTo: { type: type as 'lead' | 'account', id, name }
    });
    setNewTaskTitle('');
    setDueDate('');
    setRelatedTo('');
  };

  return (
    <div className="space-y-6">
       <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Add New Task</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                  <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-300 mb-1">Task Title</label>
                  <input
                      id="taskTitle"
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g., Follow up with Jane Doe"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                      required
                  />
              </div>
              <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                  <input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                      required
                  />
              </div>
              <div className="flex-grow">
                <label htmlFor="relatedTo" className="block text-sm font-medium text-gray-300 mb-1">Related To</label>
                <select 
                    id="relatedTo"
                    value={relatedTo}
                    onChange={e => setRelatedTo(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                    required
                >
                    <option value="">Select...</option>
                    <optgroup label="Leads">
                        {leads.map(lead => <option key={`lead-${lead.id}`} value={`lead:${lead.id}`}>{lead.name}</option>)}
                    </optgroup>
                    <optgroup label="Accounts">
                        {accounts.map(acc => <option key={`acc-${acc.id}`} value={`account:${acc.id}`}>{acc.name}</option>)}
                    </optgroup>
                </select>
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md transition-colors h-fit">
                  Add Task
              </button>
          </form>
       </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-2xl font-bold text-white p-4">Tasks ({tasks.length})</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-12">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Related To</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Due Date</th>
                </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
                {tasks.length > 0 ? tasks.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((task) => (
                <tr key={task.id} className={`${task.completed ? 'bg-green-900/20' : ''}`}>
                    <td className="px-6 py-4">
                        <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"/>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-white ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{task.relatedTo.name} <span className="text-xs text-gray-500 capitalize">({task.relatedTo.type})</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{task.dueDate}</td>
                </tr>
                )) : (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500">
                        No tasks found.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default TaskListView;
