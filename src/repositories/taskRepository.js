export class TaskRepository {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  create(taskInput) {
    const task = {
      id: this.nextId++,
      description: taskInput.description ?? null,
      relatedTaskId: taskInput.relatedTaskId ?? null,
      createdAt: new Date().toISOString(),
      ...taskInput
    };

    this.tasks.push(task);
    return task;
  }

  list() {
    return [...this.tasks];
  }

  getById(id) {
    return this.tasks.find((task) => task.id === id) ?? null;
  }

  update(id, updates) {
    const task = this.getById(id);
    if (!task) return null;

    Object.assign(task, updates);
    return task;
  }
}
