import Content from './Content'
import Actions from './actions'

Stage.defineWidget({
    id: 'githubPullRequestWidget',
    name: 'Github Pull Request Widget',
    description: 'This is a widget for list pull request',
    initialWidth: 12,
    initialHeight: 30,
    color: 'olive',
    isReact: true,
    permission: Stage.GenericConfig.CUSTOM_WIDGET_PERMISSIONS.CUSTOM_ALL,
    categories: [Stage.GenericConfig.CATEGORY.OTHERS],
    initialConfiguration: [{
        repositoryOwner: 'OanaBenes',
        repositoryName: 'hello-world',
        userOrganization: '',
        pageSize: Stage.GenericConfig.PAGE_SIZE_CONFIG(),
    }

    ],
    fetchData: function (widget, toolbox, params) {

        let actions = new Actions(toolbox, widget.definition.initialConfiguration[0]);

        return Promise.resolve(actions.fetchPullRequest().then(response => response.json()).then(data => {
            let promises = [];
            _.each(data, (item) => {
                let promise1 = actions.fetchRequestDetails(item.number)
                    .then(response1 => response1.json()).then(details => {
                        item['files_changed'] = details.changed_files
                        item['commits'] = details.commits
                        return details
                    })
                let promise2 = actions.fetchReviews(item.number)
                    .then(response2 => response2.json()).then(reviews => {
                        item['reviews'] = reviews;
                        return reviews
                    })
                promises.push(Promise.resolve(promise1));
                promises.push(Promise.resolve(promise2));
            });
            return Promise.resolve(Promise.all(promises).then(allResponseDone => {
                return Promise.resolve(data)
            }));
        }))

    },
    render: function (widget, data, error, toolbox) {
        let {Loading} = Stage.Basic;
        if (_.isEmpty(data)) {
            return (<Loading message='Loading pull github requests...'></Loading>)
        } else {
            return (
                <Content data={data} widget={widget}/>
            )
        }

    }

});