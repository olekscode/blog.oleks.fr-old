"use strict";

import urls from './constants.js';

function getContentsOfFileFromURL(url) {
  var result = null;
  $.ajax({
    url: url,
    type: 'get',
    dataType: 'text',
    async: false,
    success: function(data) {
      result = data;
    }
  });
  return result;
}

function getJsonFromURL(url) {
  var jsonString = getContentsOfFileFromURL(url);
  return JSON.parse(jsonString);
}

function convertMarkdownToHtml(markdownText) {
  var converter = new showdown.Converter();
  return converter.makeHtml(markdownText);
}

function onContentReloaded() {
  Prism.highlightAll();
}

function openInMainArea(html) {
  document.getElementById('container').innerHTML = html;
}

function removeFirstHeader(html) {
  // First <h1> header is a title of the post. We will replace it with our own
  // custom title block - with title, date, author, etc.
  return html.replace(/<h1.*>.+<\/h1>/, '');
}

function preprocessPostHtml(html) {
  html = removeFirstHeader(html);
  return html;
}

function postHeaderHtml(post) {
  return `<h1>${post.title}</h1><h2>${post.datePublished}</h2>`;
}

function postContentsHtml(post) {
  var url = urls.postsFolder + `/${post.id}.md`;
  var markdownText = getContentsOfFileFromURL(url);
  var html = convertMarkdownToHtml(markdownText);
  html = preprocessPostHtml(html);
  return `<div id="post">${html}</div>`;
}

function openPost(post) {
  var postHeader = postHeaderHtml(post);
  var postContents = postContentsHtml(post);
  var html = postHeader + postContents;
  openInMainArea(html);
}

function loadPostsMetadata() {
  return getJsonFromURL(urls.postsMetadataFile);
}

function listOfPostsPage(posts) {
  var html = '<h1>My Stories</h1>';
  var listItems = "";

  for (var post of posts) {
    var itemOnClick = `window.open('?post=${post.id}', '_self'); return false;`;
    listItems += `<li>
    <a href="pleaseEnableJavaScript.html" onClick="${itemOnClick}">${post.title}</a>
    </li>`;
  }

  html += `\n<ul id="list-of-posts">${listItems}</ul>`;
  return html;
}

function openListOfPosts(posts) {
  var html = listOfPostsPage(posts);
  openInMainArea(html);
}

function routeBasedOnSearchParameter() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  var postId = urlParams.get('post');
  var posts = loadPostsMetadata();

  if (postId) {
    var post = posts.find(post => post.id == postId);
    openPost(post);
  }
  else {
    openListOfPosts(posts);
  }
}

routeBasedOnSearchParameter();
