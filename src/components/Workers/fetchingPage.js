let fetchedPostsAndPages = [];
let currentPage = 1;

export async function fetchPostsAndPages() {
  // Get the latest configSettings from localStorage
  let configSettings = JSON.parse(localStorage.getItem("configSettings"));

  if (!configSettings || !configSettings.domain) {
    alert("Please Contact Support");
    return [];
  }

  const baseUrl = `https://${configSettings.domain}/wp-json/wp/v2`;
  return await fetchWithDomainDefined(baseUrl);
}

async function fetchWithDomainDefined(baseUrl) {
  const postsPromise = fetch(
    `${baseUrl}/posts?_fields=id,title,content&page=${currentPage}&per_page=5`
  );
  const pagesPromise = fetch(
    `${baseUrl}/pages?_fields=id,title,content&page=${currentPage}&per_page=5`
  );

  const [postsResponse, pagesResponse] = await Promise.all([
    postsPromise,
    pagesPromise,
  ]);

  const checkInvalidPageNumber = (errorData) => {
    if (errorData && errorData.code === "rest_post_invalid_page_number") {
      alert("There are no more pages available.");
      return true;
    }
    return false;
  };

  const posts = await postsResponse.json();
  const pages = await pagesResponse.json();

  if (
    checkInvalidPageNumber(posts) ||
    checkInvalidPageNumber(pages) ||
    !postsResponse.ok ||
    !pagesResponse.ok
  ) {
    console.error("Error fetching posts or pages.");
    return;
  }

  const combined = [...posts, ...pages].map((item) => ({
    id: item.id,
    title: item.title.rendered,
    content: item.content.rendered,
  }));

  fetchedPostsAndPages = [...fetchedPostsAndPages, ...combined];
  currentPage++;

  return fetchedPostsAndPages;
}
