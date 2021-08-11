import { model, Model, Schema, Types, VirtualType } from 'mongoose';
import setupTestDB from '../../../utils/setupTestDB';
import paginate, { PaginationFunc } from '../../../../src/models/plugins/paginate.plugin';

interface IProject {
  name: string;
  tasks?: VirtualType;
}

interface IProjectModel extends Model<IProject> {
  paginate?: PaginationFunc<IProject>;
}

const projectSchema = new Schema<IProject, IProjectModel>({
  name: {
    type: String,
    required: true,
  },
});

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});

projectSchema.plugin(paginate);
const ProjectModel = model('Project', projectSchema);

interface ITask {
  name: string;
  project: Types.ObjectId;
}

interface ITaskModel extends Model<ITask> {
  paginate?: PaginationFunc<ITask>;
}

const taskSchema = new Schema<ITask, ITaskModel>({
  name: {
    type: String,
    required: true,
  },
  project: {
    type: Types.ObjectId,
    ref: 'Project',
    required: true,
  },
});

taskSchema.plugin(paginate);
const TaskModel = model('Task', taskSchema);

setupTestDB();

describe('paginate plugin', () => {
  describe('populate option', () => {
    test('should populate the specified data fields', async () => {
      const project = await ProjectModel.create({ name: 'Project One' });
      const task = await TaskModel.create({ name: 'Task One', project: project._id });

      const taskPages = await TaskModel.paginate({ _id: task._id }, { populate: 'project' });

      expect(taskPages.results[0].project).toHaveProperty('_id', project._id);
    });

    test('should populate nested fields', async () => {
      const project = await ProjectModel.create({ name: 'Project One' });
      const task = await TaskModel.create({ name: 'Task One', project: project._id });

      const projectPages = await ProjectModel.paginate({ _id: project._id }, { populate: 'tasks.project' });
      const { tasks } = projectPages.results[0];

      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toHaveProperty('_id', task._id);
      expect(tasks[0].project).toHaveProperty('_id', project._id);
    });
  });
});
