"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Papa from "papaparse";
import route from "@/config";
import { Button } from "@/components/ui/button";
import { CheckboxDropdown } from "@/components/checkbox-dropdown";
import ChartSkeleton from "@/components/chart-skeleton";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioDropdown } from "@/components/radio-dropdown";

// Add banner component
interface BannerProps {
  data: { type: string; year: number; value: number } | null;
  visible: boolean;
  position: { x: number; y: number };
}

const Banner: React.FC<BannerProps> = ({ data, visible, position }) => (
  <div
    className={`
      absolute 
      px-4 
      py-2 
      bg-white 
      border 
      shadow-lg 
      rounded-md 
      transition-all 
      duration-200 
      ${visible ? "opacity-100" : "opacity-0"}
    `}
    style={{
      left: position.x,
      top: position.y,
      transform: "translate(-50%, -120%)",
    }}
  >
    <div className="flex flex-col gap-1">
      {data && (
        <>
          <div className="font-semibold text-sm">{data.type}</div>
          <div className="text-xs text-gray-600">
            Year: {data.year}
            <br />
            Value: {data.value?.toFixed(2)}
          </div>
        </>
      )}
    </div>
  </div>
);

// Add RulerFlag component
interface RulerFlagProps {
  data: {
    type: string;
    year: string;
    value: number;
  } | null;
  position: { x: number; y: number };
}

const LaneMiles = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [fullData, setFullData] = useState<{ [key: string]: any }[]>([]);
  const [isCreatingChart, setIsCreatingChart] = useState<boolean>(false);
  const [currentDataset, setCurrentDataset] = useState<any[]>([]);

  const [selectedLevel, setSelectedLevel] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [selectedYear, setSelectedYear] = useState<
    { id: number; label: string }[]
  >([]);
  const [selectedDistrict, setSelectedDistrict] = useState<
    { id: number; label: string }[]
  >([]);
  const [selectedCounty, setSelectedCounty] = useState<
    { id: number; label: string }[]
  >([]);
  const [selectedType, setSelectedType] = useState<
    { id: number; label: string }[]
  >([]);
  // Add state for hover tracking
  const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);

  // Add new state for hover tracking
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Add state for hovered data
  const [hoveredData, setHoveredData] = useState<{
    type: string;
    year: number;
    value: number;
  } | null>(null);

  // Add state for hover tracking
  const [hoverData, setHoverData] = useState<{
    type: string;
    year: number;
    value: number;
  } | null>(null);

  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Add flag component
  const HoverFlag: React.FC<{
    data: { type: string; year: number; value: number } | null;
    position: { x: number; y: number };
  }> = ({ data, position }) => (
    <div
      className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full"
      style={{
        left: position.x,
        top: position.y - 10,
        opacity: data ? 1 : 0,
        transition: "opacity 0.2s",
      }}
    >
      <div className="bg-white px-3 py-2 rounded shadow-lg border text-sm">
        <div className="font-medium">{data?.type}</div>
        <div className="text-gray-600 text-xs">
          Year: {data?.year}
          <br />
          Miles: {data?.value?.toFixed(2)}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    getData()
      .then((parsedData) => {
        setFullData(parsedData);
        // Set default filters
        setSelectedLevel({ id: 1, label: "District" });
        setSelectedYear([
          { id: 0, label: "1996" },
          { id: 1, label: "1997" },
          { id: 2, label: "2018" },
          { id: 3, label: "2020" },
          { id: 4, label: "2021" },
          { id: 5, label: "2022" },
        ]);
        setSelectedDistrict([
          { id: 1, label: "PARIS" },
          { id: 4, label: "04 - AMARILLO" },
          { id: 21, label: "21 - PHARR" },
          { id: 11, label: "11 - LUFKIN" },
        ]);
        setSelectedType([
          { id: 1, label: "CRCP" },
          { id: 2, label: "JRCP" },
          { id: 3, label: "JPCP" },
        ]);
        handleApplyFilter(); // Call the function to apply the default filter
      })
      .catch((error) => {
        console.error("Error parsing CSV:", error);
      });
  },);

  async function getData(): Promise<any[]> {
    const response = await fetch(`${route}/files/Concrete_distresses.csv`);
    if (!response.ok) {
      throw new Error(`Failed to load CSV file`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length) {
            reject(results.errors);
          } else {
            resolve(results.data);
          }
        },
      });
    });
  }

  const yearItems = Array.from(
    new Set(fullData && fullData.map((item) => item.EFF_YEAR))
  ).map((value, index) => ({ id: index, label: value }));
  const districtItems = Array.from(
    new Set(fullData && fullData.map((item) => item.RESPONSIBLE_DISTRICT))
  ).map((value, index) => ({ id: index, label: value }));
  const countyItems = Array.from(
    new Set(fullData && fullData.map((item) => item.COUNTY))
  ).map((value, index) => ({ id: index, label: value }));

  function handleApplyFilter() {
    function organizeDataBasedOnFilter(
      selectedItems: { id: number; label: string }[],
      selectedYear: { id: number; label: string }[],
      filter: string
    ) {
      const data = fullData.filter(
        (item) =>
          selectedItems
            .map((selectedItem) => selectedItem.label)
            .includes(item[filter]) &&
          selectedYear
            .map((selectedYear) => selectedYear.label)
            .includes(item.EFF_YEAR)
      );
      return data;
    }

    function sumValuesByFilter(
      filterAttribute: string,
      data: Record<string, any>[]
    ): Record<string, Record<string, Record<string, number>>> {
      const result: Record<string, Record<string, Record<string, number>>> = {};

      data.forEach((item) => {
        const filterValue = item[filterAttribute];
        const year = item.EFF_YEAR;
        if (!filterValue || !year) return;

        const detailedPavTypeMatch = item.DETAILED_PAV_TYPE.match(/\((.*?)\)/);
        const detailedPavType = detailedPavTypeMatch
          ? detailedPavTypeMatch[1]
          : null;
        if (
          !detailedPavType ||
          !["CRCP", "JRCP", "JPCP"].includes(detailedPavType)
        )
          return;

        if (!result[filterValue]) {
          result[filterValue] = {};
        }

        if (!result[filterValue][year]) {
          result[filterValue][year] = { CRCP: 0, JRCP: 0, JPCP: 0 };
        }

        result[filterValue][year][detailedPavType] += item.TX_LENGTH || 0;
      });

      return result;
    }

    setIsCreatingChart(true);

    const dataByDistrict = sumValuesByFilter(
      "RESPONSIBLE_DISTRICT",
      organizeDataBasedOnFilter(
        selectedDistrict,
        selectedYear,
        "RESPONSIBLE_DISTRICT"
      )
    );
    const dataByCounty = sumValuesByFilter(
      "COUNTY",
      organizeDataBasedOnFilter(selectedCounty, selectedYear, "COUNTY")
    );

    let aggregatedData: Record<
      string,
      Record<string, Record<string, number>>
    > = {};
    let exportDataset: any[] = [];

    if (selectedLevel?.label === "District") {
      aggregatedData = dataByDistrict;
      exportDataset = Object.entries(aggregatedData).flatMap(
        ([district, years]) =>
          Object.entries(years).flatMap(([year, types]) =>
            Object.entries(types).map(([type, value]) => ({
              District: district,
              Year: year,
              Type: type,
              "Lane Miles": value,
            }))
          )
      );
      drawChart(aggregatedData, "Lane Miles in Texas by Selected District");
    } else if (selectedLevel?.label === "County") {
      aggregatedData = dataByCounty;
      exportDataset = Object.entries(aggregatedData).flatMap(
        ([county, years]) =>
          Object.entries(years).flatMap(([year, types]) =>
            Object.entries(types).map(([type, value]) => ({
              County: county,
              Year: year,
              Type: type,
              "Lane Miles": value,
            }))
          )
      );
      drawChart(aggregatedData, "Lane Miles in Texas by Selected County");
    }

    setCurrentDataset(exportDataset);
    setIsCreatingChart(false);
  }

  const handleCSVExport = () => {
    if (currentDataset.length === 0) {
      alert("No data to export!");
      return;
    }

    const csvContent = [
      Object.keys(currentDataset[0]).join(","),
      ...currentDataset.map((item) => Object.values(item).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "lane_miles_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePNGExport = () => {
    if (!svgRef.current) {
      alert("No chart to export!");
      return;
    }

    // Add white background
    const svg = d3.select(svgRef.current);
    const background = svg
      .insert("rect", ":first-child")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white");

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      if (!svgRef.current) {
        alert("No chart to export!");
        return;
      }
      canvas.width = svgRef.current.clientWidth;
      canvas.height = svgRef.current.clientHeight;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const link = document.createElement("a");
        link.download = "lane_miles_chart.png";
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Remove background after export
        background.remove();
      } else {
        alert("Failed to export chart: Canvas context is not available.");
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const addInteractiveRuler = (
    chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    x0: d3.ScaleBand<string>,
    x1: d3.ScaleBand<string>,
    y: d3.ScaleLinear<number, number>,
    height: number,
    width: number,
    years: string[]
  ) => {
    // Create rulers
    const xRuler = chartGroup
      .append("line")
      .attr("class", "x-ruler")
      .style("stroke", "#666")
      .style("stroke-width", "1px")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0);

    const yRuler = chartGroup
      .append("line")
      .attr("class", "y-ruler")
      .style("stroke", "#666")
      .style("stroke-width", "1px")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0);

    // Mouse tracking
    chartGroup
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", (event) => {
        const [mouseX, mouseY] = d3.pointer(event);

        xRuler
          .attr("x1", mouseX)
          .attr("x2", mouseX)
          .attr("y1", 0)
          .attr("y2", height)
          .style("opacity", 1);

        yRuler
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", mouseY)
          .attr("y2", mouseY)
          .style("opacity", 1);

        const hoveredYear = years[Math.floor(mouseX / x1.step())];

        setHoverData({
          type: x0.domain()[Math.floor(mouseX / x0.step())],
          year: Number(hoveredYear),
          value: y.invert(mouseY),
        });

        setHoverPosition({
          x: event.pageX,
          y: event.pageY,
        });
      })
      .on("mouseleave", () => {
        xRuler.style("opacity", 0);
        yRuler.style("opacity", 0);
        setHoverData(null);
      });
  };

  const drawChart = (
    data: Record<string, Record<string, Record<string, number>>>,
    title: string
  ) => {
    const typeColors: { [key: string]: string } = {
      CRCP: "#1f77b4",
      JRCP: "#ff7f0e",
      JPCP: "#2ca02c",
    };

    const selectedTypes = selectedType.map((item) => item.label);
    const dataset = Object.entries(data).flatMap(([filterItem, years]) =>
      Object.entries(years).flatMap(([year, types]) =>
        Object.entries(types)
          .filter(([type]) => selectedTypes.includes(type))
          .map(([type, value]) => ({
            filterItem,
            year,
            type,
            value,
          }))
      )
    );

    const filterItems = Array.from(new Set(dataset.map((d) => d.filterItem)));
    const years = Array.from(new Set(dataset.map((d) => d.year)));
    const types = selectedTypes;

    const margin = { top: 20, right: 20, bottom: 110, left: 90 };
    const width = 1150 - margin.left - margin.right;
    const height = 750 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const chartGroup = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add tooltip container at the start of createChart function
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "10px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", "100")
      .style("transition", "opacity 0.2s");

    // Scales
    const x0 = d3
      .scaleBand()
      .domain(filterItems)
      .range([0, width]) // District or County
      .paddingInner(0.1)
      .paddingOuter(0.1);

    const x1 = d3
      .scaleBand()
      .domain(years)
      .range([0, x0.bandwidth()]) // Year
      .padding(0.2); // Increase space between bars within groups

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d.value) || 0]) // Y-axis
      .nice()
      .range([height, 0]);

    // Axes and Title
    svg
      .append("text")
      .attr("x", width / 2 + 70) // Title center
      .attr("y", margin.top) // Title top
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text(title); // Title: Lane Miles in Texas by Selected District or County

    chartGroup
      .append("g")
      .call(d3.axisLeft(y)) // Y-axis
      .selectAll("text")
      .attr("x", -20)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px");

    chartGroup
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x0).ticks(10)) // X-axis
      .selectAll("text")
      .attr("transform", "rotate(-45) translate(-5, -25)") // Rotate the text by -45 degrees and move 20px to the left
      .attr("y", 30)
      .attr("x", -10)
      .attr("text-anchor", "end")
      .attr("font-size", "12px");

    chartGroup
      .append("text") // X-axis
      .attr("x", -(height / 2)) // Center vertically
      .attr("y", -55) // Lane-Miles
      .attr("text-anchor", "middle") //
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .attr("transform", "rotate(-90)") // X-axis
      .style("fill", "#333")
      .text("Length (Lane-Miles)");

    // Draw bars
    const groups = chartGroup
      .selectAll(".filter-group")
      .data(filterItems)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${x0(d)}, 0)`); // Move filter items closer to the x-axis.

    groups // Filter group
      .selectAll(".year-group")
      .data((filterItem) =>
        years.map((year) => ({
          filterItem,
          year,
          types: dataset.filter(
            (d) => d.filterItem === filterItem && d.year === year
          ),
        }))
      )
      .enter()
      .append("g")
      .attr("class", "year-group")
      .attr("transform", (d) => `translate(${x1(d.year)}, 0)`) // Year group
      .selectAll("rect") // Bars
      .data((d) => d.types)
      .enter()
      .append("rect")
      .attr("x", (d) => x1(d.type) ?? 0) // x1(d.type) is not undefined
      .attr("y", (d) => y(d.value) ?? height) // Ensure y(d.value) is not undefined
      .attr("width", x1.bandwidth())
      .attr("height", (d) => height - (y(d.value) ?? height))
      .attr("fill", (d) => typeColors[d.type])
      .on(
        "mouseover",
        function (this: SVGRectElement, event: MouseEvent, d: any) {
          d3.select(this).style("opacity", 0.8);

          tooltip.transition().duration(200).style("opacity", 0.9);

          tooltip
            .html(
              `
            <div class="font-semibold">Type: ${d.type}</div>
            <div>Value: ${d.value.toFixed(2)}</div>
            <div>Year: ${d.year}</div>
          `
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        }
      )
      .on("mousemove", function (event: MouseEvent) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function (this: SVGRectElement) {
        d3.select(this).style("opacity", 1);

        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Add horizontal rules for each tick
    y.ticks().forEach((tickValue) => {
      const ruleY = y(tickValue);
      chartGroup
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", ruleY)
        .attr("y2", ruleY)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0)
        .attr("stroke-dasharray", "4 4");
    });

    // Add legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 120}, ${margin.top / 2})`);

    types.forEach((type, i) => {
      legend
        .append("rect")
        .attr("x", 150)
        .attr("y", i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", typeColors[type]); // Use static colors 3 barrinhas coloridas

      legend
        .append("text")
        .attr("x", 170)
        .attr("y", i * 20 + 10) // Letrinhas da barras coloridas
        .attr("height", 25)
        .attr("font-size", "12px")
        .text(type);
      chartGroup.call(addInteractiveRuler, x0, x1, y, height, width, years);
      chartGroup.call(addInteractiveRuler, x0, x1, y, height, width, years);
    });
    chartGroup.call(addInteractiveRuler, x0, x1, y, height, width, years);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100">
      {/* Filter Controls */}
      <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm mb-6">
        {/* Primary Row - Filters and Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Level Selector */}
          <RadioDropdown
            items={[
              { id: 1, label: "District" },
              { id: 2, label: "County" },
            ]}
            selectedItem={selectedLevel}
            setSelectedItem={setSelectedLevel}
            type="Level"
          />

          {/* Conditional Filters */}
          {selectedLevel && selectedLevel.label === "District" ? (
            <CheckboxDropdown
              items={districtItems}
              selectedItems={selectedDistrict}
              setSelectedItems={setSelectedDistrict}
              type="District"
            />
          ) : (
            <CheckboxDropdown
              items={countyItems}
              selectedItems={selectedCounty}
              setSelectedItems={setSelectedCounty}
              type="County"
            />
          )}
          <CheckboxDropdown
            items={yearItems}
            selectedItems={selectedYear}
            setSelectedItems={setSelectedYear}
            type="Year"
          />
          <CheckboxDropdown
            items={[
              { id: 1, label: "CRCP" },
              { id: 2, label: "JRCP" },
              { id: 3, label: "JPCP" },
            ]}
            selectedItems={selectedType}
            setSelectedItems={setSelectedType}
            type="Type"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end border-t pt-2">
          <Button
            onClick={handleApplyFilter}
            disabled={isCreatingChart}
            className="min-w-[120px]"
          >
            {isCreatingChart ? (
              <Icon icon="line-md:loading-loop" className="animate-spin" />
            ) : (
              "Apply Filters"
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={currentDataset.length === 0 || isCreatingChart}
              >
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={handleCSVExport}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handlePNGExport}>
                Export Image
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 p-6 bg-white rounded-lg shadow-sm">
        {isCreatingChart ? (
          <ChartSkeleton />
        ) : (
          // Update chart container
          <div className="relative">
            <Banner
              data={hoveredData}
              visible={!!hoveredData}
              position={hoverPosition}
            />
            <div
              className="overflow-x-auto overflow-y-auto"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            >
              <svg ref={svgRef} />
            </div>
            <HoverFlag data={hoverData} position={hoverPosition} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LaneMiles;
