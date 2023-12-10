import { Menu, MenuItem } from 'obsidian';
import type { StatusRegistry } from '../../StatusRegistry';
import { replaceTaskWithTasks } from '../../File';
import type { Task } from '../../Task';
import { StatusSettings } from '../../Config/StatusSettings';

/**
 * A function for replacing one task with zero or more new tasks.
 * @see {@link defaultTaskSaver}
 */
type TaskSaver = (originalTask: Task, newTasks: Task | Task[]) => Promise<void>;

/**
 * A default implementation of {@link TaskSaver} that calls {@link replaceTaskWithTasks}
 * @param originalTask
 * @param newTasks
 */
async function defaultTaskSaver(originalTask: Task, newTasks: Task | Task[]) {
    await replaceTaskWithTasks({
        originalTask,
        newTasks,
    });
}

/**
 * Base class for Menus that offer editing one or more properties of a Task object.
 *
 * A {@link TaskSaver} function must be supplied, in order for any edits to be saved.
 * Derived classes should default to using {@link defaultTaskSaver}, but allow
 * alternative implementations to be used in tests.
 */
class TaskEditingMenu extends Menu {
    protected readonly taskSaver: TaskSaver;

    /**
     * Constructor, which sets up the menu items.
     * @param taskSaver - a {@link TaskSaver} function, for saving any edits.
     */
    constructor(taskSaver: TaskSaver) {
        super();

        this.taskSaver = taskSaver;
    }
}

/**
 * A Menu of options for editing the status of a Task object.
 *
 * @example
 *     checkbox.addEventListener('contextmenu', (ev: MouseEvent) => {
 *         const menu = new StatusMenu(StatusRegistry.getInstance(), task);
 *         menu.showAtPosition({ x: ev.clientX, y: ev.clientY });
 *     });
 *     checkbox.setAttribute('title', 'Right-click for options');
 */
export class StatusMenu extends TaskEditingMenu {
    private statusRegistry: StatusRegistry;

    /**
     * Constructor, which sets up the menu items.
     * @param statusRegistry - the statuses to be shown in the menu.
     * @param task - the Task to be edited.
     * @param taskSaver - an optional {@link TaskSaver} function. For details, see {@link TaskEditingMenu}.
     */
    constructor(statusRegistry: StatusRegistry, task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        this.statusRegistry = statusRegistry;

        const commonTitle = 'Change status to:';

        const getMenuItemCallback = (task: Task, item: MenuItem, statusName: string, newStatusSymbol: string) => {
            const title = `${commonTitle} [${newStatusSymbol}] ${statusName}`;
            item.setTitle(title)
                .setChecked(newStatusSymbol === task.status.symbol)
                .onClick(async () => {
                    if (newStatusSymbol !== task.status.symbol) {
                        const status = this.statusRegistry.bySymbol(newStatusSymbol);
                        const newTask = task.handleStatusChangeFromContextMenuWithRecurrenceInUsersOrder(status);
                        await this.taskSaver(task, newTask);
                    }
                });
        };

        const coreStatuses = new StatusSettings().coreStatuses.map((setting) => setting.symbol);
        // Put the core statuses at the top of the menu:
        for (const matchCoreTask of [true, false]) {
            for (const status of statusRegistry.registeredStatuses) {
                if (coreStatuses.includes(status.symbol) === matchCoreTask) {
                    this.addItem((item) => getMenuItemCallback(task, item, status.name, status.symbol));
                }
            }
        }
    }
}
