import React from 'react'
import { Link } from 'react-router-dom'

/*
    import { UserContext } from '../context'
    static contextType = UserContext
    this.context.currentUser
*/

export default (
    { selectedIndex = 0 } // FIXME selectedIndex value
) => (
    <header className="app-back-color-dark-navy fixed-top">
        <div className="d-flex justify-content-right">
            <span id="app-logo" className="mr-auto">
                <Link to="/">
                    <img src="/img/logo-beta.png" />
                </Link>
            </span>
            <span className="link-text">
                <Link className="nav-link font-weight-light" to="/how_to">
                    使い方
                </Link>
            </span>
        </div>
        <style jsx>{`
            header {
                height: 64px;
            }
            #app-logo {
                width: 200px;
                height: 64px;
                padding: 0;
                margin-left: 50px;
            }
            #app-logo img {
                width: 200px;
                height: 64px;
            }
            .link-text {
                color: var(--soft-white);
                font-size: 16px;
                min-width: 100px;
                margin-left: 10px;
                margin-right: 10px;
                text-align: center;
                line-height: 64px;
            }
            .link-text::after {
                display: block;
                content: '';
                background-color: var(--dark-navy);
                margin-top: -3px;
                height: 3px;
            }
            .link-text:hover::after {
                background-color: var(--attention-orange);
            }
            .link-text:nth-of-type(${selectedIndex})::after {
                background-color: var(--attention-orange);
            }
            .link-text > :global(.nav-link) {
                text-decoration: none;
                padding: 0;
            }
            .link-text > :global(.nav-link):link {
                color: var(--soft-white);
            }
            .link-text > :global(.nav-link):visited {
                color: var(--soft-white);
            }
            .link-text > :global(.nav-link):hover {
                text-decoration: none;
                color: var(--soft-white);
            }
            .link-text > :global(.nav-link):active {
                color: var(--soft-white);
            }
            .disabled-link {
                cursor: not-allowed;
            }
        `}</style>
    </header>
)
