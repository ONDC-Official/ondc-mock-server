#!/bin/sh
RUN mkdir domain-repos
git init
git submodule init
git submodule update

# Retail B2B
git submodule add -b release-2.0.2 https://github.com/ONDC-Official/ONDC-RET-Specifications domain-repos/@retail-b2b/release-2.0.2
git submodule add -b b2c_exports_2.0 https://github.com/ONDC-Official/ONDC-RET-Specifications domain-repos/@retail-b2b/b2c_exports_2.0


# Services
git submodule add -b draft-services https://github.com/ONDC-Official/ONDC-SRV-Specifications domain-repos/@services/draft-services
git submodule add -b draft-agri_services https://github.com/ONDC-Official/ONDC-SRV-Specifications domain-repos/@services/draft-agri-services
git submodule add -b draft-healthcare https://github.com/ONDC-Official/ONDC-SRV-Specifications domain-repos/@services/draft-healthcare-service
git submodule add -b draft-agri_equipment https://github.com/ONDC-Official/ONDC-SRV-Specifications domain-repos/@services/draft-agri_equipment
git submodule add -b draft-agri_bids_and_auction https://github.com/ONDC-Official/ONDC-SRV-Specifications domain-repos/@services/draft-agri_bids_and_auction
git submodule add -b draft-astro https://github.com/ONDC-Official/ONDC-SRV-Specifications domain-repos/@services/draft-astro


# Logisitcs
git submodule add -b draft-2.x https://github.com/ONDC-Official/ONDC-LOG-Specifications domain-repos/@logistics/draft-2.x


# MEC
git submodule add -b draft-print_media https://github.com/ONDC-Official/ONDC-MEC-Specifications domain-repos/@mec/draft-print_media