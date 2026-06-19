import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../lib/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, LogOut, Check, Trash2, Edit2, X, Calendar, Clock, Search, Filter, Bell, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    dueDate: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchPriority, setSearchPriority] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchTasks();

    if (socket) {
      socket.on('task_created', (newTask) => {
        setTasks((prev) => [newTask, ...prev]);
      });

      socket.on('task_updated', (updatedTask) => {
        setTasks((prev) =>
          prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
        );
      });

      socket.on('task_deleted', (deletedId) => {
        setTasks((prev) => prev.filter((task) => task._id !== deletedId));
      });

      return () => {
        socket.off('task_created');
        socket.off('task_updated');
        socket.off('task_deleted');
      };
    }
  }, [socket]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      resetForm();
      if (!socket) fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category || 'personal',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      if (!socket) fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      const response = await api.patch(`/tasks/${id}/complete`);
      const updatedTask = response.data;
      
      // Update local state immediately for better UX
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );
      
      if (!socket) fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'personal',
      dueDate: '',
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-900/50 text-red-200 border-red-700';
      case 'medium':
        return 'bg-yellow-900/50 text-yellow-200 border-yellow-700';
      case 'low':
        return 'bg-green-900/50 text-green-200 border-green-700';
      default:
        return 'bg-gray-700 text-gray-200 border-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/50 text-green-200 border-green-700';
      case 'in_progress':
        return 'bg-blue-900/50 text-blue-200 border-blue-700';
      case 'pending':
        return 'bg-gray-700 text-gray-200 border-gray-600';
      default:
        return 'bg-gray-700 text-gray-200 border-gray-600';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'personal':
        return 'bg-purple-900/50 text-purple-200 border-purple-700';
      case 'work':
        return 'bg-blue-900/50 text-blue-200 border-blue-700';
      case 'study':
        return 'bg-orange-900/50 text-orange-200 border-orange-700';
      case 'health':
        return 'bg-green-900/50 text-green-200 border-green-700';
      default:
        return 'bg-gray-700 text-gray-200 border-gray-600';
    }
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'completed' || !dueDate) return false;
    const daysRemaining = getDaysRemaining(dueDate);
    return daysRemaining < 0;
  };

  const filteredTasks = tasks.filter((task) => {
    // Search by name (title)
    const matchesSearch = searchTerm === '' || task.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Search by category
    const matchesCategory = searchCategory === 'all' || task.category === searchCategory;
    
    // Search by priority
    const matchesPriority = searchPriority === 'all' || task.priority === searchPriority;
    
    // Filter by status
    let matchesStatus = true;
    if (statusFilter === 'completed') {
      matchesStatus = task.status === 'completed';
    } else if (statusFilter === 'pending') {
      matchesStatus = task.status === 'pending' || task.status === 'in_progress';
    } else if (statusFilter === 'overdue') {
      matchesStatus = isOverdue(task.dueDate, task.status);
    }
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const getUpcomingTasks = () => {
    return tasks.filter(task => {
      if (task.status === 'completed' || !task.dueDate) return false;
      const daysRemaining = getDaysRemaining(task.dueDate);
      return daysRemaining >= 0 && daysRemaining <= 2;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const upcomingTasks = getUpcomingTasks();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">TaskFlow – Smart Task Management System</h1>
            <p className="text-sm text-gray-300">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {upcomingTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {upcomingTasks.length}
                  </span>
                )}
              </Button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-semibold text-white">Upcoming Deadlines</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {upcomingTasks.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        No upcoming deadlines
                      </div>
                    ) : (
                      upcomingTasks.map(task => {
                        const daysRemaining = getDaysRemaining(task.dueDate);
                        return (
                          <div key={task._id} className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{task.title}</p>
                                <p className="text-sm text-gray-300">
                                  {daysRemaining === 0 ? (
                                    'Due today'
                                  ) : daysRemaining === 1 ? (
                                    'Due tomorrow'
                                  ) : (
                                    `Due in ${daysRemaining} days`
                                  )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Your Tasks</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </>
            )}
          </Button>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search by Name */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-gray-300">Search by Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Search by Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="searchCategory" className="text-gray-300">Category</Label>
                  <Select
                    id="searchCategory"
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="study">Study</option>
                    <option value="health">Health</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchPriority" className="text-gray-300">Priority</Label>
                  <Select
                    id="searchPriority"
                    value={searchPriority}
                    onChange={(e) => setSearchPriority(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </div>
              </div>

              {/* Filter by Status */}
              <div className="space-y-2">
                <Label className="text-gray-300">Filter by Status</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'completed' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('completed')}
                  >
                    Completed
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('overdue')}
                  >
                    Overdue
                  </Button>
                </div>
              </div>

              {/* Clear Filters */}
              {(searchTerm || searchCategory !== 'all' || searchPriority !== 'all' || statusFilter !== 'all') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchCategory('all');
                    setSearchPriority('all');
                    setStatusFilter('all');
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {showForm && (
          <Card className="mb-6 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">{editingTask ? 'Edit Task' : 'Create New Task'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter task title"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter task description"
                    rows={3}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                    <Select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-gray-300">Category</Label>
                    <Select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white"
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="study">Study</option>
                      <option value="health">Health</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-gray-300">Due Date *</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingTask ? 'Update Task' : 'Create Task'}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {filteredTasks.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  {tasks.length === 0 ? 'No tasks yet. Create your first task!' : 'No tasks match your search criteria.'}
                </p>
                {tasks.length === 0 ? (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSearchCategory('all');
                      setSearchPriority('all');
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => {
              const daysRemaining = getDaysRemaining(task.dueDate);
              const overdue = isOverdue(task.dueDate, task.status);
              
              return (
                <Card 
                  key={task._id} 
                  className={`hover:shadow-lg transition-shadow bg-gray-800/50 border-gray-700 ${
                    task.status === 'completed' ? 'opacity-75' : ''
                  } ${
                    overdue ? 'border-red-500 border-2 bg-red-900/20' : ''
                  }`}
                >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-white">{task.title}</CardTitle>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  {task.description && (
                    <CardDescription className="mt-2 text-gray-300">{task.description}</CardDescription>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryColor(task.category)}>
                      {task.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {task.dueDate && (
                    <div className={`flex items-center gap-2 text-sm ${
                      overdue ? 'text-red-400 font-semibold' : 'text-gray-300'
                    }`}>
                      <Calendar className="h-4 w-4" />
                      {overdue ? (
                        <span>Overdue by {Math.abs(daysRemaining)} day{Math.abs(daysRemaining) !== 1 ? 's' : ''}</span>
                      ) : daysRemaining === 0 ? (
                        <span>Due today</span>
                      ) : daysRemaining === 1 ? (
                        <span>Due in 1 day</span>
                      ) : (
                        <span>Due in {daysRemaining} days</span>
                      )}
                    </div>
                  )}
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant={task.status === 'completed' ? 'outline' : 'default'}
                        onClick={() => handleToggleComplete(task._id)}
                        className="flex-1"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {task.status === 'completed' ? 'Undo' : 'Complete'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(task)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(task._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
