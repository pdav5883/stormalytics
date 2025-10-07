import "../styles/custom.css"
import $ from "jquery"
import { initNavbar } from "blr-shared-frontend"
import { navbarConfig } from "../config/navbar-config.js"

$(function() { 
  initNavbar(navbarConfig)
})

