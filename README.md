# Nokia SR Linux YANG Browser

Documentation: https://learn.srlinux.dev/yang/browser/

Nokia SR Linux makes extensive use of structured data models. Each application, provided by Nokia or written by a user against the NDK, has a YANG model that defines its configuration and state.

With this design, the YANG data model is defined first, then the CLI, APIs, and show output formats are derived from it.

A central role that is given to YANG in SR Linux Network OS demands a convenient interface to browse, search through and process these data models.

To answer these requirements, this portal provides:

* Fast Path Browser to effectively search through thousands of available YANG paths
* Beautiful Tree browser to traverse the tree representation of the entire YANG data model of SR Linux
* Source .yang files neatly stored in a nokia/srlinux-yang-models repository for programmatic access and code generation
