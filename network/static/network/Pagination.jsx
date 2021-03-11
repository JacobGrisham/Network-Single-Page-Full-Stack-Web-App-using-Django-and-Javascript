import React from "react";
import { render } from "react-dom";

class Pagination extends ReactComponent {

  constructor(props) {
    super(props);
    this.state = {
      page: 0
    }
  }

  render() {
    return (
      <nav class="mt-4" aria-label="Page navigation" id="page-navigation">
        <ul class="pagination justify-content-center">
            <li class="page-item"><button class="page-link" id="{this.state.page}" type="button" onClick={this.pageNavigation}>Previous</button></li>
            <li class="page-item"><button class="page-link" id="{this.state.page}" type="button" onClick={this.pageNavigation}>Next</button></li>
        </ul>
      </nav>
    )
  }

  ReactDOM.render(<Pagination />, document.querySelector("#page-navigation"));
}

function pageNavigation(view, user_id, page) {
  var previous =  document.querySelector('#previous');
  if (page == 0) {
    previous.setAttribute("disabled", "disabled");
    previous.parentNode.classList.add('disabled');
  }
  previous.addEventListener('click', () => {
    if (page == 0) {
      previous.setAttribute("disabled", "disabled");
      previous.parentNode.classList.add('disabled');
    }
    else if (page > 0) {
      page = page - 1
    }
    loadPosts(view, user_id, page)
  });
  document.querySelector('#next').addEventListener('click', () => {
    previous.removeAttribute("disabled");
    previous.parentNode.classList.remove('disabled');
    page = page + 1
    loadPosts(view, user_id, page)
  });