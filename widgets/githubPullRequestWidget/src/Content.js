import React from 'react'

export default class Content extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            openModal:false,
            pullRequestDescription:'',
            pullRequestList:[],
            commentDetails:{},
            reviewComment:{},
            showCommentModal:false,
            pullRequestDetails:'',
            eventComment:false,
            requestChanges:false,
            errors:{
                "body":'Please provide body',
                "commitId":'Please provide commitId',
                "reviewBody":'Please provide review comment body',
                "filePath":'Please provide file path',
                "position":'Please provide position'
            }
        }
    }
    _openModalDescription(item){

        this.setState({openModal: true, pullRequestDescription:item.title});
    }
    _closeModal(){

        this.setState({openModal: false, pullRequestDescription:'',showCommentModal:false, requestChanges:false, eventComment:false} )
    }
    _openModalComment(item, field){

        this.setState({showCommentModal:true})
        if(field =='eventComment'){
            this.setState({eventComment:true,requestChanges:false})

        }else if(field =='requestChanges'){
            this.setState({requestChanges:true})
        }
        this.setState({showCommentModal: true, pullRequestDetails:item });
    }
    _handleInputChange(event){

        this.setState({

            commentDetails:{
                ...this.state.commentDetails,
                [event.target.name]: event.target.value
            }
        })

    }
    _handleInputChangeReview(event){
        this.setState({
            reviewComment:{
                ...this.state.reviewComment,
                [event.target.name]: event.target.value
            }
        })
    }
    _makeReviewRequest(field, item){
        return fetch('https://api.github.com/repos/OanaBenes/hello-world/pulls/'+item.number+'/reviews', {
            method:"POST",
            headers: {'Content-Type':'application/json'},
            body:{"event":field}
        }).then(response =>{
            if (!response.ok) {

                throw Error(response.statusText);
            }
            return response;
        })
            .then(data=>{
                return data
            }).catch(error =>
                alert(error)
            )
    }
    _submitComment(){
        if(this.state.eventComment || this.state.requestChanges){
            const requestOpt = {
                "commit_id":this.state.commentDetails.commitId,
                "event": this.state.eventComment ? "COMMENT" : 'REQUEST_CHANGES',
                "body": this.state.commentDetails.body ,
                "comments":[
                    {
                        "body": this.state.reviewComment.reviewBody,
                        "path": this.state.reviewComment.fileName,
                        "position": parseInt(this.state.reviewComment.position)
                    }
                ],
            }
            fetch('https://api.github.com/repos/OanaBenes/hello-world/pulls/'+this.state.pullRequestDetails.number+'/reviews', {
                method: 'post',
                headers: {'Content-Type':'application/json'},
                body:JSON.stringify(requestOpt)
            }).then(response =>{
                if (!response.ok) {
                    throw Error(response.statusText);
                }

                return response;

            }).then(data=>{
                return data
            }).catch(error =>
                alert(error)
            )
        }else {
            const requestOpt = {
                "body": this.state.commentDetails.body,
                "commit_id":this.state.commentDetails.commitId,
                "path":this.state.commentDetails.fileName,
                "position": parseInt(this.state.commentDetails.position)
            }
            fetch('https://api.github.com/repos/OanaBenes/hello-world/pulls/'+this.state.pullRequestDetails.number+'/comments', {
                method: 'post',
                headers: {'Content-Type':'application/json'},
                body:JSON.stringify(requestOpt)
            }).then(response =>{
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response;
            }).then(data=>{
                return data
            }).catch(error =>
                alert(error)
            )

        }

    }
    _handleReviewOpt(field, item){
        switch (field) {
            case 'approve':
                this._makeReviewRequest('APPROVE', item)
                break;
            case 'comment':
                this._openModalComment(item, 'eventComment');
                break;
            case 'changes':
                this._openModalComment(item, 'request' );
                break
            default:
                break
        }

    }
    render() {
        let { DataTable,ReadmeModal,Modal,Button,Form} = Stage.Basic;
        return (
            <div>
            <DataTable fetchData={this.props.fetchData}
                       totalSize={this.props.data.length}
                       pageSize={this.props.widget.configuration.pageSize}
                       selectable={true}>
                <DataTable.Column label="ID"  />
                <DataTable.Column label="PR header" name="pr_header" />
                <DataTable.Column label="Number of files changed" name="files_changed" />
                <DataTable.Column label="Number of commits"  name="commits"/>
                <DataTable.Column label="Link to PR in Github" name='link_to' />
                <DataTable.Column label="Review status"  name='review_status' />
                <DataTable.Column label='Action'/>
                <DataTable.Column label='Add review'/>
                <DataTable.Column label=''/>
                {
                this.props.data.map(item=>{
                    return (
                        <DataTable.Row key={item.id} style={{display:'flex',justifyContent: 'center', alignItems:'center',flexDirection:'column' }} >
                            <DataTable.Data>{item.id}</DataTable.Data>
                            <DataTable.Data>{item.title} </DataTable.Data>
                            <DataTable.Data>{item.files_changed}</DataTable.Data>
                            <DataTable.Data>{item.commits}</DataTable.Data>
                            <DataTable.Data> <a href={item.html_url}> {item.html_url} </a> </DataTable.Data>
                            <DataTable.Data style={{display:'flex',justifyContent: 'center', alignItems:'center',flexDirection:'column' }} >
                                {item.reviews.map(review => (<a key={review.id} href={review.html_url} > {review.state}</a> ) )}
                                </DataTable.Data>
                            <DataTable.Data  >
                                <Button onClick={()=>{this._openModalComment(item)}}>Add comment</Button>
                               </DataTable.Data>
                            <DataTable.Data >
                                <div style={{display:'flex',justifyContent: 'space-between', alignItems:'center',flexDirection:'column'}}>
                                    <Button onClick={()=>{event.preventDefault();this._handleReviewOpt('approve', item)}}>Approve</Button>
                                    <Button onClick={()=>{event.preventDefault();this._handleReviewOpt('comment',item)}}>Comment</Button>
                                    <Button onClick={()=>{event.preventDefault();this._handleReviewOpt('changes',item)}}>Request changes</Button>
                                </div>

                            </DataTable.Data>
                            <DataTable.Data><Button  onClick={()=>{this._openModalDescription(item)}}>Description</Button> </DataTable.Data>
                        </DataTable.Row>

                    )
                })
                }
             </DataTable>
                <ReadmeModal open={this.state.openModal}
                             content={this.state.pullRequestDescription}
                             onHide={this._closeModal.bind(this)} />
                <Modal open={this.state.showCommentModal}>
                    <Modal.Header>Comment</Modal.Header>
                    <Modal.Content>
                        <Form errors={this.state.errors} >
                            <Form.Field error={this.state.errors.body} required>
                                <Form.Input name='body' placeholder="Body"
                                            value={this.state.commentDetails.body} onChange={this._handleInputChange.bind(this)}/>
                            </Form.Field>

                            <Form.Field error={this.state.errors.commitId} required>
                                <Form.Input name='commitId' placeholder="Commit Id"
                                            value={this.state.commentDetails.commitId} onChange={this._handleInputChange.bind(this)}/>
                            </Form.Field>
                            {this.state.eventComment || this.state.requestChanges ?
                                <div>
                                    <h3>Review Comment</h3>
                                    <Form.Field error={this.state.errors.reviewBody}>
                                        <Form.Input name='reviewBody' placeholder="Review Comment Body"
                                                    value={this.state.reviewComment.body} onChange={this._handleInputChangeReview.bind(this)}/>
                                    </Form.Field>
                                </div>
                                : ''
                            }
                            <Form.Field error={this.state.errors.filePath} required>
                                <Form.Input name='fileName' placeholder="File path"
                                            value={(this.state.eventComment || this.state.requestChanges ) ?this.state.reviewComment.fileName  : this.state.commentDetails.fileName} onChange={(this.state.eventComment || this.state.requestChanges ) ? this._handleInputChangeReview.bind(this) : this._handleInputChange.bind(this)}/>
                            </Form.Field>
                            <Form.Field error={this.state.errors.position} required>
                                <Form.Input type='number' name='position' placeholder="Position"
                                            value={(this.state.eventComment || this.state.requestChanges ) ?this.state.reviewComment.position  : this.state.commentDetails.position} onChange={(this.state.eventComment || this.state.requestChanges ) ? this._handleInputChangeReview.bind(this) : this._handleInputChange.bind(this)}/>
                            </Form.Field>

                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this._submitComment.bind(this)}> Submit</Button>
                        <Button  onClick={this._closeModal.bind(this)}> Close</Button>
                    </Modal.Actions>
                </Modal>
            </div>
        );
    }
}