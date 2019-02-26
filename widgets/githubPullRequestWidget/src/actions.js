export default class {

    constructor(toolbox, config) {
        this.toolbox = toolbox;
        this.widgetConfig = {
            repository: config.userOrganization != '' ? config.userOrganization : config.repositoryOwner,
            repositoryName: config.repositoryName
        };

    }

    fetchPullRequest() {
        return fetch('https://api.github.com/repos/' + this.widgetConfig.repository + '/' + this.widgetConfig.repositoryName + '/pulls?state=open')
    }

    fetchRequestDetails(number) {
        return fetch('https://api.github.com/repos/' + this.widgetConfig.repository + '/' + this.widgetConfig.repositoryName + '/pulls/' + number)
    }

    fetchReviews(number) {
        return fetch('https://api.github.com/repos/' + this.widgetConfig.repository + '/' + this.widgetConfig.repositoryName + '/pulls/' + number + '/reviews')
    }
}

