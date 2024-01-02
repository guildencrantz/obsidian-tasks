import { QueryLayoutOptions } from './QueryLayoutOptions';

/**
 * Various rendering options of tasks in a query.
 * See applyOptions below when adding options here.
 *
 * @see QueryLayoutOptions
 */
export class TaskLayoutOptions {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    hidePriority: boolean = false;
    hideCreatedDate: boolean = false;
    hideStartDate: boolean = false;
    hideScheduledDate: boolean = false;
    hideDoneDate: boolean = false;
    hideCancelledDate: boolean = false;
    hideDueDate: boolean = false;
    hideRecurrenceRule: boolean = false;
    hideTags: boolean = false;
}

export type TaskLayoutComponent =
    // NEW_TASK_FIELD_EDIT_REQUIRED
    | 'description'
    | 'priority'
    | 'recurrenceRule'
    | 'createdDate'
    | 'startDate'
    | 'scheduledDate'
    | 'dueDate'
    | 'doneDate'
    | 'cancelledDate'
    | 'blockLink';

/**
 * This represents the desired layout of tasks when they are rendered in a given configuration.
 * The layout is used when flattening the task to a string and when rendering queries, and can be
 * modified by applying {@link TaskLayoutOptions} objects.
 */
export class TaskLayout {
    public get shownTaskLayoutComponents(): TaskLayoutComponent[] {
        return this._shownTaskLayoutComponents;
    }
    public defaultLayout: TaskLayoutComponent[] = [
        // NEW_TASK_FIELD_EDIT_REQUIRED
        'description',
        'priority',
        'recurrenceRule',
        'createdDate',
        'startDate',
        'scheduledDate',
        'dueDate',
        'cancelledDate',
        'doneDate',
        'blockLink',
    ];
    private _shownTaskLayoutComponents: TaskLayoutComponent[];
    public hiddenTaskLayoutComponents: TaskLayoutComponent[] = [];
    public taskLayoutOptions: TaskLayoutOptions;
    public queryLayoutOptions: QueryLayoutOptions;
    public taskListHiddenClasses: string[] = [];

    constructor(taskLayoutOptions?: TaskLayoutOptions, queryLayoutOptions?: QueryLayoutOptions) {
        if (taskLayoutOptions) {
            this.taskLayoutOptions = taskLayoutOptions;
        } else {
            this.taskLayoutOptions = new TaskLayoutOptions();
        }
        if (queryLayoutOptions) {
            this.queryLayoutOptions = queryLayoutOptions;
        } else {
            this.queryLayoutOptions = new QueryLayoutOptions();
        }

        this._shownTaskLayoutComponents = this.defaultLayout;
        this.applyOptions();
    }

    private applyOptions() {
        // Remove components from the layout according to the task options. These represent the existing task options,
        // so some components (e.g. the description) are not here because there are no layout options to remove them.
        const componentsToHideAndGenerateClasses: [boolean, TaskLayoutComponent][] = [
            // NEW_TASK_FIELD_EDIT_REQUIRED
            [this.taskLayoutOptions.hidePriority, 'priority'],
            [this.taskLayoutOptions.hideRecurrenceRule, 'recurrenceRule'],
            [this.taskLayoutOptions.hideCreatedDate, 'createdDate'],
            [this.taskLayoutOptions.hideStartDate, 'startDate'],
            [this.taskLayoutOptions.hideScheduledDate, 'scheduledDate'],
            [this.taskLayoutOptions.hideDueDate, 'dueDate'],
            [this.taskLayoutOptions.hideCancelledDate, 'cancelledDate'],
            [this.taskLayoutOptions.hideDoneDate, 'doneDate'],
        ];
        for (const [hide, component] of componentsToHideAndGenerateClasses) {
            this.hideComponent(hide, component);
            this.generateHiddenClassForTaskList(hide, component);
        }

        const componentsToGenerateClassesOnly: [boolean, string][] = [
            // Tags are hidden, rather than removed. See tasks-layout-hide-tags in styles.css.
            [this.taskLayoutOptions.hideTags, 'tags'],

            // The following components are handled in QueryRenderer.ts and thus are not part of the same flow that
            // hides TaskLayoutComponent items. However, we still want to have 'tasks-layout-hide' items for them
            // (see https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1866).
            // This can benefit from some refactoring, i.e. render these components in a similar flow rather than
            // separately.
            [this.queryLayoutOptions.hideUrgency, 'urgency'],
            [this.queryLayoutOptions.hideBacklinks, 'backlinks'],
            [this.queryLayoutOptions.hideEditButton, 'edit-button'],
            [this.queryLayoutOptions.hidePostponeButton, 'postpone-button'],
        ];
        for (const [hide, component] of componentsToGenerateClassesOnly) {
            this.generateHiddenClassForTaskList(hide, component);
        }

        if (this.queryLayoutOptions.shortMode) this.taskListHiddenClasses.push('tasks-layout-short-mode');
    }

    private generateHiddenClassForTaskList(hide: boolean, component: string) {
        if (hide) {
            this.taskListHiddenClasses.push(`tasks-layout-hide-${component}`);
        }
    }

    /**
     * Move a component from the shown to hidden if the given layoutOption criteria is met.
     */
    private hideComponent(hide: boolean, component: TaskLayoutComponent) {
        if (hide) {
            this.hiddenTaskLayoutComponents.push(component);
            this._shownTaskLayoutComponents = this._shownTaskLayoutComponents.filter((element) => element != component);
        }
    }
}
