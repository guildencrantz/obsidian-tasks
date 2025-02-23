import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { FilenameField } from '../../src/Query/Filter/FilenameField';
import { FolderField } from '../../src/Query/Filter/FolderField';
import { PathField } from '../../src/Query/Filter/PathField';
import { RootField } from '../../src/Query/Filter/RootField';
import { makeQueryContext } from '../../src/Scripting/QueryContext';

describe('QueryContext', () => {
    describe('values should all match their corresponding filters', () => {
        const path = 'a/b/c.md';
        const task = new TaskBuilder().path(path).build();
        const queryContext = makeQueryContext(path);

        it('root', () => {
            const instruction = `root includes ${queryContext.query.file.root}`;
            const filter = new RootField().createFilterOrErrorMessage(instruction);
            expect(filter).toMatchTask(task);
        });

        it('path', () => {
            const instruction = `path includes ${queryContext.query.file.path}`;
            const filter = new PathField().createFilterOrErrorMessage(instruction);
            expect(filter).toMatchTask(task);
        });

        it('folder', () => {
            const instruction = `folder includes ${queryContext.query.file.folder}`;
            const filter = new FolderField().createFilterOrErrorMessage(instruction);
            expect(filter).toMatchTask(task);
        });

        it('filename', () => {
            const instruction = `filename includes ${queryContext.query.file.filename}`;
            const filter = new FilenameField().createFilterOrErrorMessage(instruction);
            expect(filter).toMatchTask(task);
        });
    });
});
