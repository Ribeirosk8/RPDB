"use client";

import React, { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LEVEL_1_SECTION_ROWS,
  SIDENAV_ITEMS,
} from "@/components/side-nav/constants";
import { SideNavItem } from "@/components/side-nav/types";
import { Icon } from "@iconify/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useRouter } from "next/navigation";


interface SidebarItem {
  title: string;
  content: string;
}

// Sample data for the sidebar items
const GENERAL_SECTION_ITEMS = [
  {
    title: "Lane Miles",
    content: "Lane miles vs Year chart for specific combinations of filter",
    route: "lane-miles",
  },
  {
    title: "PMIS Data",
    content:
      "Distress Score (DS), Ride Score (RS), and Condition Score (= DS*RS)",
    route: "pmis-data",
  },
  {
    title: "Traffic Data",
    content: "Average Annual Daily Traffic (AADT), and Truck Percentage",
    route: "traffic-data",
  },
];

const SPECIAL_SECTION_ITEMS = [
  {
    title: "(FT-CRCP) Fast Track CRCP",
    content: "View your dashboard and key metrics",
  },
  {
    title: "(BCO) Bonded concrete overlay",
    content: "Manage your ongoing projects",
  },
  {
    title: "(UBCO) Unbonded concrete overlay",
    content: "View and update your task list",
  },
  { title: "Whitetopping", content: "View and update your task list" },
  {
    title: "(PCP) Precast Concrete Pavement",
    content: "View and update your task list",
  },
  {
    title: "(RCCP) Roller Compacted Concrete Pavement",
    content: "View and update your task list",
  },
  {
    title: "(RCA) Recycled Concrete Aggregates",
    content: "View and update your task list",
  },
  {
    title: "(PTCP) Post Tension Concrete Pavement",
    content: "View and update your task list",
  },
];

const EXPERIMENTAL_SECTION_ITEMS = [
  {
    title: "Research Project 0-1244",
    content: "View your dashboard and key metrics",
  },
  { title: "Research Project 0-3925", content: "Manage your ongoing projects" },
  {
    title: "Research Project 0-4826",
    content: "View and update your task list",
  },
  {
    title: "Research Project 5-9046",
    content: "View and update your task list",
  },
  {
    title: "Research Project 0-7026",
    content: "View and update your task list",
  },
];

const FORENSIC_EVALUATIONS_ITEMS = [
  {
    title: "1. I 10 Embankment Evaluation (San Antonio)",
    content: "View your dashboard and key metrics",
  },
  { title: "2. A", content: "Manage your ongoing projects" },
  { title: "3. B", content: "View and update your task list" },
  { title: "10.J", content: "View and update your task list" },
];

const SPECIFICATIONS_ITEMS = [
  {
    title: "Standard Specifications",
    content: "View your dashboard and key metrics",
  },
  { title: "Manual & guidelines", content: "Manage your ongoing projects" },
  { title: "Roadway Standards", content: "View and update your task list" },
];

const SideNav = () => {
  const [openSubGeneralSheet, setOpenSubGeneralSheet] = useState<string | null>(
    null
  );
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

  const navigate = useRouter();

  return (
    <nav className="md:w-60 bg-white h-screen flex-shrink-0 fixed border-r border-zinc-200 hidden md:flex">
      <div className="flex flex-col space-y-6 sm:w-full">
        <Link
          className="flex flex-row space-x-3 items-center justify-center md:justify-start md:px-6 border-b border-zinc-200 h-12 w-full"
          href="/"
        >
          <span className="h-7 w-7 bg-zinc-300 rounded-lg" />
          <span className="font-bold text-xl hidden md:flex">RPDB project</span>
        </Link>

        <ScrollArea className="sm:!m-0">
          {/* <div className="sm:!m-0"> */}
          <div className="flex flex-col flex-grow space-y-2 px-2">
            <Accordion type="multiple">
              {/* GENERAL SECTION */}
              <AccordionItem value="general">
                <AccordionTrigger showArrow className="px-4">
                  General Section
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible>
                    {GENERAL_SECTION_ITEMS.map((item, index) => (
                      <AccordionItem key={index} value={item.route}>
                        <AccordionTrigger
                          key={index}
                          className="px-6"
                          onClick={() =>
                            navigate.push(`/general/${item.route}`)
                          }
                        >
                          {item.title}
                        </AccordionTrigger>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>

              {/* LEVEL 1 SECTION */}
              <Sheet modal={false}>
                <SheetTrigger asChild>
                  <AccordionItem value="section-1">
                    <AccordionTrigger className="px-4">
                      Level 1 Section
                    </AccordionTrigger>
                  </AccordionItem>
                </SheetTrigger>
                <ScrollArea>
                  <SheetContent side="left" className="sm:w-[30svw] left-60">
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>No</TableHead>
                            <TableHead>Section ID</TableHead>
                            <TableHead>Highway</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {LEVEL_1_SECTION_ROWS.map((row) => (
                            <TableRow
                              key={row.index}
                              className="hover:cursor-pointer"
                              onClick={() => navigate.push("/section_one")}
                            >
                              <TableCell>{row.index}</TableCell>
                              <TableCell>{row.sectionId}</TableCell>
                              <TableCell>{row.highway}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </SheetContent>
                </ScrollArea>
              </Sheet>

              {/* SPECIAL SECTIONS */}
              <AccordionItem value="special">
                <AccordionTrigger showArrow className="px-4">
                  Special Section
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible>
                    {SPECIAL_SECTION_ITEMS.map((item, index) => (
                      <Sheet
                        modal={false}
                        key={index}
                        open={openSubGeneralSheet === item.title}
                        onOpenChange={(isOpen) =>
                          setOpenSubGeneralSheet(isOpen ? item.title : null)
                        }
                      >
                        <SheetTrigger asChild>
                          <AccordionItem
                            value={`item-${index}`}
                            className="sm:w-[80%] translate-x-[20%]"
                          >
                            <AccordionTrigger className="px-4 truncate">
                              {item.title}
                            </AccordionTrigger>
                          </AccordionItem>
                        </SheetTrigger>
                        <SheetContent
                          side="left"
                          className="w-[400px] sm:w-[540px] left-60"
                        >
                          <h3 className="text-2xl font-semibold mb-4">
                            {item.title}
                          </h3>
                          <Accordion type="single" collapsible>
                            <AccordionItem value="sectionData">
                              <AccordionTrigger showArrow>
                                Section Data
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col">
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Location Information
                                  </div>
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Pavement Information
                                  </div>
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Construction Information
                                  </div>
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Plan sets
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="surveyData">
                              <AccordionTrigger showArrow>
                                Survey Data
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col">
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Deflection
                                  </div>
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    LTE
                                  </div>
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Pictures
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="report">
                              <AccordionTrigger showArrow>
                                Report
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col">
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Research Reports/TM
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </SheetContent>
                      </Sheet>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>

              {/* EXPERIMENTAL SECTIONS */}
              <AccordionItem value="experimental">
                <AccordionTrigger showArrow className="px-4">
                  Experimental Section
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible>
                    {EXPERIMENTAL_SECTION_ITEMS.map((item, index) => (
                      <Sheet
                        modal={false}
                        key={index}
                        open={openSubGeneralSheet === item.title}
                        onOpenChange={(isOpen) =>
                          setOpenSubGeneralSheet(isOpen ? item.title : null)
                        }
                      >
                        <SheetTrigger asChild>
                          <AccordionItem
                            value={`item-${index}`}
                            className="sm:w-[80%] translate-x-[20%]"
                          >
                            <AccordionTrigger className="px-4 truncate">
                              {item.title}
                            </AccordionTrigger>
                          </AccordionItem>
                        </SheetTrigger>
                        <SheetContent
                          side="left"
                          className="w-[400px] sm:w-[540px] left-60"
                        >
                          <h3 className="text-2xl font-semibold mb-4">
                            {item.title}
                          </h3>
                          <Accordion type="single" collapsible>
                            <AccordionItem value="sectionData">
                              <AccordionTrigger showArrow>
                                Section Data
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col">
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Location Information
                                  </div>
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Pavement Information
                                  </div>
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Construction Information
                                  </div>
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Plan sets
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="surveyData">
                              <AccordionTrigger showArrow>
                                Survey Data
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col">
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Deflection
                                  </div>
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    LTE
                                  </div>
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Pictures
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="report">
                              <AccordionTrigger showArrow>
                                Report
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col">
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Research Reports/TM
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </SheetContent>
                      </Sheet>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>

              {/* FORENSIC EVALUATIONS */}
              <AccordionItem value="forensic">
                <AccordionTrigger showArrow className="px-4">
                  Forensic Evaluations
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible>
                    {FORENSIC_EVALUATIONS_ITEMS.map((item, index) => (
                      <Sheet
                        modal={false}
                        key={index}
                        open={openSubGeneralSheet === item.title}
                        onOpenChange={(isOpen) =>
                          setOpenSubGeneralSheet(isOpen ? item.title : null)
                        }
                      >
                        <SheetTrigger asChild>
                          <AccordionItem
                            value={`item-${index}`}
                            className="sm:w-[80%] translate-x-[20%]"
                          >
                            <AccordionTrigger className="px-4 truncate">
                              {item.title}
                            </AccordionTrigger>
                          </AccordionItem>
                        </SheetTrigger>
                        <SheetContent
                          side="left"
                          className="w-[400px] sm:w-[540px] left-60"
                        >
                          <h3 className="text-2xl font-semibold mb-4">
                            {item.title}
                          </h3>
                          <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                            Evaluation Reports/TM
                          </div>
                        </SheetContent>
                      </Sheet>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>

              {/* SPECIFICATIONS */}
              <AccordionItem value="specifications">
                <AccordionTrigger showArrow className="px-4">
                  Specifications
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible>
                    {SPECIFICATIONS_ITEMS.map((item, index) => (
                      <Sheet
                        modal={false}
                        key={index}
                        open={openSubGeneralSheet === item.title}
                        onOpenChange={(isOpen) =>
                          setOpenSubGeneralSheet(isOpen ? item.title : null)
                        }
                      >
                        <SheetTrigger asChild>
                          <AccordionItem
                            value={`item-${index}`}
                            className="sm:w-[80%] translate-x-[20%]"
                          >
                            <AccordionTrigger className="px-4 truncate">
                              {item.title}
                            </AccordionTrigger>
                          </AccordionItem>
                        </SheetTrigger>
                        <SheetContent
                          side="left"
                          className="w-[400px] sm:w-[540px] left-60"
                        >
                          <h3 className="text-2xl font-semibold mb-4">
                            {item.title}
                          </h3>
                          <Accordion type="single" collapsible>
                            <AccordionItem value="stdSpec">
                              <AccordionTrigger showArrow>
                                Standard Specifications
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col">
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Standard Specifications for Construction and
                                    Maintenance of Highways, Streets, and
                                    Bridges(2024)
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="guidelines">
                              <AccordionTrigger showArrow>
                                Manual & guidelines
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col">
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    Pavement Manual (2021)
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="standards">
                              <AccordionTrigger showArrow>
                                Roadway Standards
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col">
                                  <div className="sm:py-2 sm:px-4 hover:cursor-pointer hover:bg-slate-600/30 rounded-lg transition delay-75">
                                    CRCP(1)-23 / CRCP(2)-23
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </SheetContent>
                      </Sheet>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          {/* </div> */}
        </ScrollArea>
      </div>
    </nav>
  );
};

export default SideNav;

const GeneralSection = () => {
  const [openSubGeneralSheet, setOpenSubGeneralSheet] = useState<string | null>(
    null
  );

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value="CRCP">
          <AccordionTrigger>CRCP</AccordionTrigger>
          <AccordionContent>
            <Accordion type="single" collapsible>
              <Sheet
                open={openSubGeneralSheet === "laneMiles"}
                onOpenChange={(isOpen) =>
                  setOpenSubGeneralSheet(isOpen ? "laneMiles" : null)
                }
              >
                <SheetTrigger asChild>
                  <AccordionItem value="laneMiles">
                    <AccordionTrigger></AccordionTrigger>
                  </AccordionItem>
                </SheetTrigger>
                <SheetContent>whatever</SheetContent>
              </Sheet>
            </Accordion>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="JRCP">
          <AccordionTrigger>JRCP</AccordionTrigger>
          <AccordionContent></AccordionContent>
        </AccordionItem>
        <AccordionItem value="CPCD(JPCD)">
          <AccordionTrigger>CPCD(JPCD)</AccordionTrigger>
          <AccordionContent></AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
const MenuItem = ({ item }: { item: SideNavItem }) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };

  return (
    <div className="">
      {item.submenu ? (
        <>
          <button
            onClick={toggleSubMenu}
            className={`flex flex-row items-center p-2 rounded-lg w-full justify-between hover:bg-zinc-100 ${
              (pathname ?? '').includes(item.path) ? "bg-zinc-100" : ""
            }`}
          >
            <div className="flex flex-row space-x-4 items-center">
              {/* {item.icon} */}
              <span className="font-semibold text-l flex">{item.title}</span>
            </div>

            <div className={`${subMenuOpen ? "rotate-180" : ""} flex`}>
              <Icon icon="lucide:chevron-down" width="24" height="24" />
            </div>
          </button>

          {subMenuOpen && (
            <div className="my-2 ml-6 flex flex-col space-y-4">
              {item.subMenuItems?.map((subItem, idx) => {
                return (
                  <Link
                    key={idx}
                    href={subItem.path}
                    className={`${
                      subItem.path === pathname ? "font-bold" : ""
                    }`}
                  >
                    <span>{subItem.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.path}
          className={`flex flex-row space-x-4 items-center p-2 rounded-lg hover:bg-zinc-100 ${
            item.path === pathname ? "bg-zinc-100" : ""
          }`}
        >
          {item.icon}
          <span className="font-semibold text-l flex">{item.title}</span>
        </Link>
      )}
    </div>
  );
};
