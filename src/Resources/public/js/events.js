/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Commercial License (PCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.org)
 *  @license    http://www.pimcore.org/license     GPLv3 and PCL
 */

/**
 * on search result initialize
 * extensionBag is passed as parameters
 */
pimcore.events.onAdvancedObjectSearchResult = "pimcore.advancedObjectSearch.result.initialize";

//TODO: delete in Pimcore11 and update dependency in composer.json
if(typeof addEventListenerCompatibilityForPlugins === "function") {
    let eventMappings = [];
    eventMappings["onAdvancedObjectSearchResult"] = pimcore.events.onAdvancedObjectSearchResult;
    addEventListenerCompatibilityForPlugins(eventMappings);
} else {
    console.error("Delete addEventListenerCompatibilityForPlugins in the advanced-object-search");
}