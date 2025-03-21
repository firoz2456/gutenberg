/**
 * WordPress dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Creates new post.
 *
 * @this {import('.').Editor}
 * @param {Object}  object                    Object to create new post, along with tips enabling option.
 * @param {string}  [object.postType]         Post type of the new post.
 * @param {string}  [object.title]            Title of the new post.
 * @param {string}  [object.content]          Content of the new post.
 * @param {string}  [object.excerpt]          Excerpt of the new post.
 * @param {boolean} [object.showWelcomeGuide] Whether to show the welcome guide.
 * @param {boolean} [object.legacyCanvas]     Whether the non-iframed editor canvas is awaited.
 */
export async function createNewPost( {
	postType,
	title,
	content,
	excerpt,
	showWelcomeGuide = false,
	legacyCanvas = false,
} = {} ) {
	const query = addQueryArgs( '', {
		post_type: postType,
		post_title: title,
		content,
		excerpt,
	} ).slice( 1 );

	await this.visitAdminPage( 'post-new.php', query );

	const canvasReadyLocator = legacyCanvas
		? this.page.locator( '.edit-post-layout' )
		: this.page
				.frameLocator( '[name=editor-canvas]' )
				.locator( 'body > *' )
				.first();

	await canvasReadyLocator.waitFor();

	await this.page.evaluate( ( welcomeGuide ) => {
		window.wp.data
			.dispatch( 'core/preferences' )
			.set( 'core/edit-post', 'welcomeGuide', welcomeGuide );

		window.wp.data
			.dispatch( 'core/preferences' )
			.set( 'core/edit-post', 'fullscreenMode', false );
	}, showWelcomeGuide );
}
