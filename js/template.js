//Going to keep this as handlebars because it makes sense. Incase there are more pages added in the future, it will be easy.
var menuInfo = document.getElementById("menu-template").innerHTML;
var pageData = {
  pages : [
    {id: 'menu-home', href: 'index.html', name: 'Home'},
    {id: 'menu-about', href: 'about.html', name: 'About'},
    {id: 'menu-team', href: 'team.html', name: 'Team'},
    {id: 'menu-research', href: 'research.html', name: 'Research'},
    {id: 'menu-news', href: 'news.html', name: 'News'},
    {id: 'menu-data', href: 'data.html', name: 'Data'},
    {id: 'menu-software', href: 'software.html', name: 'Software'},
    {id: 'menu-visualizations', href: 'visualizations.html', name: 'Visualizations'},
  ]
};

document.getElementById("menu").innerHTML = Mustache.render(menuInfo, pageData);

var side_info_html =
  '<div class="sub_menu">' +
    '<div>Recent News</div>' +
    '<div id="rssDivList">' +
      '<div id="divRssL"></div>' +
    '</div>' +
  '</div>' +
  '<div class="sub_menu">' +
    '<div>Affiliations</div>' +
    '<p>' +
      '<a href="http://www.bu.edu/">Boston University</a>' +
      '<a href="http://www.osu.edu/">The Ohio State University</a>' +
      '<a href="http://polisci.osu.edu/research/prism">PRISM</a>' +
      '<a href="http://www.bu.edu/hic/">Hariri Institute for Computing</a>' +
    '</p>' +
  '</div>';

var side_info = document.getElementById('side_info');
side_info.innerHTML += side_info_html;

var footer_html =
  '<div id="support">' +
    '<a href="http://www.nsf.gov"><img width="60" height="60" src="images/NSF.png" alt="NSF logo"></a>' +
    '<p>The Amicus Curiae Networks Project is generously supported by grants from the <a href="http://www.nsf.gov">National Science Foundation</a>.</p>' +
  '</div>' +
  '<div id="cc">' +
    '<p>This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.</p>' +
    '<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">' +
      '<img alt="Creative Commons License" src="images/by-nc-sa-88x31.png"/>' +
    '</a>' +
  '</div>';
//use jquery to populate the footer
//to add the footer to a page, just add the footer tags to the bottom of the html file
var footer = document.getElementById('footer');
footer.innerHTML += footer_html;
