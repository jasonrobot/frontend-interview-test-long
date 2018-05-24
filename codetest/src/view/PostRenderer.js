/**
 * This renders posts and their comments
 */

export default class PostRenderer {
    /**
     * construct a new PostRenderer
     *
     * @param userDataSource implements user.js:UserStorageInterface
     */
    constructor( userDataSource, addCommentHandler ) {
        this.userSource = userDataSource;
        this.addCommentHandler = addCommentHandler;

        this.classes = {
            postContainer: 'post',
            postBody: 'post__body',
            userPicture: 'post__body--pic',
            userName: 'post__body--user-name',
            postContent: 'post__body--content',
            commentSection: 'post__comments',
            commentPostsSection: 'post__comment__posts',
            commentPostContainer: 'comment-post',
            addCommentInput: 'post__add-comment',
        };
        
        this.postBodyTemplate = `<div class="${this.classes.postBody}">
                <div class="${this.classes.postBody + '--left'} row-elem">
                    <div class="${this.classes.userPicture}">
                    </div>
                </div>
                <div class="${this.classes.postBody + '--right'} row-elem">
                    <div class="${this.classes.userName}">
                    </div>
                    <div class="${this.classes.postContent}">
                    </div>
                </div>
            </div>`;
        
        this.postContainerTemplate = `<div class="${this.classes.postContainer}">
                <div class="${this.classes.commentSection}">
                    <div class="${this.classes.commentPostsSection}">
                    </div>
                    <div class="${this.classes.addCommentInput}">
                        <form>
                            <input placeholder="post a comment"></input>
                            <input type="hidden" name="parent-post"></input>
                        </form>
                    </div>
                </div>
            </div>`;

        this.commentContainerTemplate = `<div class="${this.classes.commentPostContainer}"></div>`;
    }

    /**
     * Render the main content of a post into HTML. Works for posts and comments
     *
     * @param post Post object
     * @param isComment boolean whether this post is a comment
     * @return jQuery obj
     */
    renderPostBody( post ) {
        let postUser = this.userSource.loadOne( post.userId );
        let $post = $( this.postBodyTemplate );
        $post.attr( 'post-id', post.id );

        //no comment section if this is a comment
        // if (isComment) {
            // $post.find( '.' + this.classes.commentSection ).remove();
        // }
        
        //FIXME doesnt like settign src attr
        $post.find( '.' + this.classes.userPicture ).append( '<img src="' + postUser.pic + '" />' );
        // $post.find( '.' + this.classes.userPicture ).attr( 'src', postUser.pic );
        $post.find( '.' + this.classes.userName ).append( postUser.username );
        $post.find( '.' + this.classes.postContent ).append( post.content );
        return $post;
    }

    /**
     * Render all the comments
     *
     * @param comments [Post]
     * @return jQuery object
     */
    renderComment( comment ) {
        //create a container
        let $commentContainer = $( this.commentContainerTemplate );
        //render post into that container
        $commentContainer.append( this.renderPostBody( comment ) );
        return $commentContainer;
    }

    /**
     * Render a post, including its comments, and users.
     *
     * @param post Post The post to render.
     * @return jQuery object
     */
    renderFullPost( post ) {
        let $fullPost = $( this.postContainerTemplate );

        $fullPost.prepend( this.renderPostBody( post ) );
        if ( post.comments.length > 0 ) {
            post.comments.forEach( (comment) => {
                $fullPost.find( '.' + this.classes.commentPostsSection ).prepend( this.renderComment( comment ) );
            } );
        }

        $fullPost.attr( 'parent-post-id', post.id );
        // $fullPost.find( '.' + this.classes.addCommentInput ).attr( 'parent-post-id', post.id );
        $fullPost.find( '.' + this.classes.addCommentInput + ' input[name="parent-post"]' ).attr( 'value', post.id );
        // $fullPost.find( '.' + this.classes.addCommentInput + ' form' ).submit(this.addCommentHandler);
        $fullPost.find( '.' + this.classes.addCommentInput + ' form' ).submit( (submitEvent) => {
            submitEvent.preventDefault();

            let event = new Event('addComment');
            event.content = submitEvent.target[0].value;
            event.parentId = Number(submitEvent.target[1].value);

            // let event = new AddCommentEvent(submitEvent.target[0].value,
                                            // submitEvent.target[1].value);

            window.dispatchEvent(event);
        } );
        return $fullPost;
    }

    /**
     * This is left for whoever is calling us to handle.
     * They should gather and iterate over what they want rendered.
     */
    // renderAllPosts( posts ) {}
}

export class AddCommentEvent {
    
    consturctor( parentId, content ) {
        
        this.parentId = Number(parentId);
        this.content = content;
        return {};
    }

    static getEventName() {
        return 'addComment';
    }
}
