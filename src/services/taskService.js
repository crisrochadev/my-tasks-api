const ACTION_BY_INTENT = {
  CREATE_TASK: 'create',
  LIST_TASKS: 'list',
  UPDATE_TASK: 'update',
  LINK_TASKS: 'link'
};

export class TaskService {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  execute(intent, data) {
    switch (intent) {
      case 'CREATE_TASK': {
        if (!data.title) throw new Error('Title is required to create a task.');
        const task = this.taskRepository.create({
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          priority: data.priority ?? 'medium'
        });

        return {
          action: ACTION_BY_INTENT[intent],
          data: task,
          message: 'Tarefa criada com sucesso'
        };
      }

      case 'LIST_TASKS': {
        const tasks = this.taskRepository.list();

        return {
          action: ACTION_BY_INTENT[intent],
          data: tasks,
          message: `Foram encontradas ${tasks.length} tarefa(s)`
        };
      }

      case 'UPDATE_TASK': {
        if (!data.id) throw new Error('Task id is required to update a task.');

        const updates = {};
        if (data.title) updates.title = data.title;
        if (data.description) updates.description = data.description;
        if (data.dueDate) updates.dueDate = data.dueDate;
        if (data.priority) updates.priority = data.priority;

        const task = this.taskRepository.update(data.id, updates);
        if (!task) throw new Error('Task not found.');

        return {
          action: ACTION_BY_INTENT[intent],
          data: task,
          message: 'Tarefa atualizada com sucesso'
        };
      }

      case 'LINK_TASKS': {
        if (!data.taskId || !data.relatedTaskId) {
          throw new Error('taskId and relatedTaskId are required to link tasks.');
        }

        const task = this.taskRepository.getById(data.taskId);
        if (!task) throw new Error('Task not found.');

        const related = this.taskRepository.getById(data.relatedTaskId);
        if (!related) throw new Error('Related task not found.');

        const updated = this.taskRepository.update(data.taskId, {
          relatedTaskId: data.relatedTaskId
        });

        return {
          action: ACTION_BY_INTENT[intent],
          data: updated,
          message: 'Tarefas relacionadas com sucesso'
        };
      }

      default:
        throw new Error('Unsupported intent.');
    }
  }
}
